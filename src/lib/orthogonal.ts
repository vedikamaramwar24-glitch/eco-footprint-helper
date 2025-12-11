// Orthogonal trajectory calculation utilities

export interface CurveFamily {
  name: string;
  pattern: RegExp;
  original: string;
  orthogonal: string;
  steps: string[];
  generateOriginal: (params: number[]) => { x: number[]; y: number[] }[];
  generateOrthogonal: (params: number[]) => { x: number[]; y: number[] }[];
}

// Generate points for a parametric curve
function generatePoints(
  fn: (t: number, param: number) => { x: number; y: number } | null,
  param: number,
  tMin: number,
  tMax: number,
  steps: number = 200
): { x: number[]; y: number[] } {
  const x: number[] = [];
  const y: number[] = [];
  const dt = (tMax - tMin) / steps;
  
  for (let i = 0; i <= steps; i++) {
    const t = tMin + i * dt;
    const point = fn(t, param);
    if (point && isFinite(point.x) && isFinite(point.y) && Math.abs(point.x) < 20 && Math.abs(point.y) < 20) {
      x.push(point.x);
      y.push(point.y);
    }
  }
  
  return { x, y };
}

// Supported curve families with their orthogonal trajectories
export const curveFamilies: CurveFamily[] = [
  {
    name: "Circles centered at origin",
    pattern: /x\^?2?\s*\+\s*y\^?2?\s*=\s*[Cc]/i,
    original: "x² + y² = C",
    orthogonal: "y = kx (straight lines through origin)",
    steps: [
      "\\text{Given family: } x^2 + y^2 = C",
      "\\text{Differentiate w.r.t. } x: \\quad 2x + 2y\\frac{dy}{dx} = 0",
      "\\text{Solve for } \\frac{dy}{dx}: \\quad \\frac{dy}{dx} = -\\frac{x}{y}",
      "\\text{For orthogonal trajectory, replace } \\frac{dy}{dx} \\text{ with } -\\frac{dx}{dy}:",
      "-\\frac{dx}{dy} = -\\frac{x}{y} \\quad \\Rightarrow \\quad \\frac{dx}{dy} = \\frac{x}{y}",
      "\\text{Rearranging: } \\frac{dx}{x} = \\frac{dy}{y}",
      "\\text{Integrating both sides: } \\ln|x| = \\ln|y| + \\ln|k|",
      "\\text{Orthogonal Trajectory: } \\boxed{y = kx}"
    ],
    generateOriginal: (params) => {
      return params.map(C => {
        const r = Math.sqrt(Math.abs(C));
        return generatePoints(
          (t) => ({ x: r * Math.cos(t), y: r * Math.sin(t) }),
          C, 0, 2 * Math.PI
        );
      });
    },
    generateOrthogonal: (params) => {
      return params.map(k => {
        return generatePoints(
          (t) => ({ x: t, y: k * t }),
          k, -10, 10
        );
      });
    }
  },
  {
    name: "Parabolas",
    pattern: /y\s*=\s*[Cc]\s*x\^?2?/i,
    original: "y = Cx²",
    orthogonal: "x² + 2y² = k (ellipses)",
    steps: [
      "\\text{Given family: } y = Cx^2",
      "\\text{Differentiate w.r.t. } x: \\quad \\frac{dy}{dx} = 2Cx",
      "\\text{From original equation: } C = \\frac{y}{x^2}",
      "\\text{Substitute: } \\frac{dy}{dx} = 2 \\cdot \\frac{y}{x^2} \\cdot x = \\frac{2y}{x}",
      "\\text{For orthogonal trajectory: } \\frac{dy}{dx} = -\\frac{x}{2y}",
      "\\text{Rearranging: } 2y\\,dy = -x\\,dx",
      "\\text{Integrating: } y^2 = -\\frac{x^2}{2} + k",
      "\\text{Orthogonal Trajectory: } \\boxed{x^2 + 2y^2 = k}"
    ],
    generateOriginal: (params) => {
      return params.map(C => {
        return generatePoints(
          (t) => ({ x: t, y: C * t * t }),
          C, -5, 5
        );
      });
    },
    generateOrthogonal: (params) => {
      return params.map(k => {
        if (k <= 0) return { x: [], y: [] };
        const a = Math.sqrt(k);
        const b = Math.sqrt(k / 2);
        return generatePoints(
          (t) => ({ x: a * Math.cos(t), y: b * Math.sin(t) }),
          k, 0, 2 * Math.PI
        );
      });
    }
  },
  {
    name: "Rectangular hyperbolas",
    pattern: /x\s*y\s*=\s*[Cc]/i,
    original: "xy = C",
    orthogonal: "x² - y² = k",
    steps: [
      "\\text{Given family: } xy = C",
      "\\text{Differentiate w.r.t. } x: \\quad y + x\\frac{dy}{dx} = 0",
      "\\text{Solve for } \\frac{dy}{dx}: \\quad \\frac{dy}{dx} = -\\frac{y}{x}",
      "\\text{For orthogonal trajectory: } \\frac{dy}{dx} = \\frac{x}{y}",
      "\\text{Rearranging: } y\\,dy = x\\,dx",
      "\\text{Integrating: } \\frac{y^2}{2} = \\frac{x^2}{2} + C_1",
      "\\text{Orthogonal Trajectory: } \\boxed{x^2 - y^2 = k}"
    ],
    generateOriginal: (params) => {
      const curves: { x: number[]; y: number[] }[] = [];
      params.forEach(C => {
        if (C === 0) return;
        curves.push(generatePoints(
          (t) => t !== 0 ? { x: t, y: C / t } : null,
          C, 0.1, 10
        ));
        curves.push(generatePoints(
          (t) => t !== 0 ? { x: t, y: C / t } : null,
          C, -10, -0.1
        ));
      });
      return curves;
    },
    generateOrthogonal: (params) => {
      const curves: { x: number[]; y: number[] }[] = [];
      params.forEach(k => {
        if (k > 0) {
          const a = Math.sqrt(k);
          curves.push(generatePoints(
            (t) => ({ x: a * Math.cosh(t), y: a * Math.sinh(t) }),
            k, -2, 2
          ));
          curves.push(generatePoints(
            (t) => ({ x: -a * Math.cosh(t), y: a * Math.sinh(t) }),
            k, -2, 2
          ));
        } else if (k < 0) {
          const a = Math.sqrt(-k);
          curves.push(generatePoints(
            (t) => ({ x: a * Math.sinh(t), y: a * Math.cosh(t) }),
            k, -2, 2
          ));
          curves.push(generatePoints(
            (t) => ({ x: a * Math.sinh(t), y: -a * Math.cosh(t) }),
            k, -2, 2
          ));
        }
      });
      return curves;
    }
  },
  {
    name: "Exponential curves",
    pattern: /y\s*=\s*[Cc]\s*e\^?\(?x\)?/i,
    original: "y = Ce^x",
    orthogonal: "y² + 2x = k (parabolas)",
    steps: [
      "\\text{Given family: } y = Ce^x",
      "\\text{Differentiate w.r.t. } x: \\quad \\frac{dy}{dx} = Ce^x",
      "\\text{From original equation: } C = ye^{-x}",
      "\\text{Substitute: } \\frac{dy}{dx} = ye^{-x} \\cdot e^x = y",
      "\\text{For orthogonal trajectory: } \\frac{dy}{dx} = -\\frac{1}{y}",
      "\\text{Rearranging: } y\\,dy = -dx",
      "\\text{Integrating: } \\frac{y^2}{2} = -x + C_1",
      "\\text{Orthogonal Trajectory: } \\boxed{y^2 + 2x = k}"
    ],
    generateOriginal: (params) => {
      return params.map(C => {
        return generatePoints(
          (t) => ({ x: t, y: C * Math.exp(t) }),
          C, -3, 3
        );
      });
    },
    generateOrthogonal: (params) => {
      return params.map(k => {
        return generatePoints(
          (t) => {
            const val = k - 2 * t;
            if (val < 0) return null;
            return { x: t, y: Math.sqrt(val) };
          },
          k, -10, k / 2
        );
      }).concat(params.map(k => {
        return generatePoints(
          (t) => {
            const val = k - 2 * t;
            if (val < 0) return null;
            return { x: t, y: -Math.sqrt(val) };
          },
          k, -10, k / 2
        );
      }));
    }
  },
  {
    name: "Straight lines through origin",
    pattern: /y\s*=\s*[Cc]\s*x(?!\^)/i,
    original: "y = Cx",
    orthogonal: "x² + y² = k (circles)",
    steps: [
      "\\text{Given family: } y = Cx",
      "\\text{Differentiate w.r.t. } x: \\quad \\frac{dy}{dx} = C",
      "\\text{From original equation: } C = \\frac{y}{x}",
      "\\text{Substitute: } \\frac{dy}{dx} = \\frac{y}{x}",
      "\\text{For orthogonal trajectory: } \\frac{dy}{dx} = -\\frac{x}{y}",
      "\\text{Rearranging: } y\\,dy = -x\\,dx",
      "\\text{Integrating: } \\frac{y^2}{2} = -\\frac{x^2}{2} + C_1",
      "\\text{Orthogonal Trajectory: } \\boxed{x^2 + y^2 = k}"
    ],
    generateOriginal: (params) => {
      return params.map(C => {
        return generatePoints(
          (t) => ({ x: t, y: C * t }),
          C, -10, 10
        );
      });
    },
    generateOrthogonal: (params) => {
      return params.map(k => {
        if (k <= 0) return { x: [], y: [] };
        const r = Math.sqrt(k);
        return generatePoints(
          (t) => ({ x: r * Math.cos(t), y: r * Math.sin(t) }),
          k, 0, 2 * Math.PI
        );
      });
    }
  },
  {
    name: "Horizontal parabolas",
    pattern: /y\^?2?\s*=\s*[Cc]\s*x/i,
    original: "y² = Cx",
    orthogonal: "2x² + y² = k (ellipses)",
    steps: [
      "\\text{Given family: } y^2 = Cx",
      "\\text{Differentiate w.r.t. } x: \\quad 2y\\frac{dy}{dx} = C",
      "\\text{From original equation: } C = \\frac{y^2}{x}",
      "\\text{Substitute: } 2y\\frac{dy}{dx} = \\frac{y^2}{x}",
      "\\text{Simplify: } \\frac{dy}{dx} = \\frac{y}{2x}",
      "\\text{For orthogonal trajectory: } \\frac{dy}{dx} = -\\frac{2x}{y}",
      "\\text{Rearranging: } y\\,dy = -2x\\,dx",
      "\\text{Orthogonal Trajectory: } \\boxed{2x^2 + y^2 = k}"
    ],
    generateOriginal: (params) => {
      const curves: { x: number[]; y: number[] }[] = [];
      params.forEach(C => {
        if (C === 0) return;
        curves.push(generatePoints(
          (t) => {
            const x = C > 0 ? t : -t;
            if (x < 0) return null;
            return { x, y: Math.sqrt(Math.abs(C) * Math.abs(x)) };
          },
          C, 0.01, 10
        ));
        curves.push(generatePoints(
          (t) => {
            const x = C > 0 ? t : -t;
            if (x < 0) return null;
            return { x, y: -Math.sqrt(Math.abs(C) * Math.abs(x)) };
          },
          C, 0.01, 10
        ));
      });
      return curves;
    },
    generateOrthogonal: (params) => {
      return params.map(k => {
        if (k <= 0) return { x: [], y: [] };
        const a = Math.sqrt(k / 2);
        const b = Math.sqrt(k);
        return generatePoints(
          (t) => ({ x: a * Math.cos(t), y: b * Math.sin(t) }),
          k, 0, 2 * Math.PI
        );
      });
    }
  },
  {
    name: "Logarithmic curves",
    pattern: /y\s*=\s*[Cc]\s*ln\s*\(?x\)?/i,
    original: "y = C·ln(x)",
    orthogonal: "x² + 2y² = k",
    steps: [
      "\\text{Given family: } y = C\\ln(x)",
      "\\text{Differentiate w.r.t. } x: \\quad \\frac{dy}{dx} = \\frac{C}{x}",
      "\\text{From original equation: } C = \\frac{y}{\\ln(x)}",
      "\\text{Substitute: } \\frac{dy}{dx} = \\frac{y}{x\\ln(x)}",
      "\\text{For orthogonal trajectory: } \\frac{dy}{dx} = -\\frac{x\\ln(x)}{y}",
      "\\text{Rearranging: } y\\,dy = -x\\ln(x)\\,dx",
      "\\text{Integrating using parts: } \\frac{y^2}{2} = -\\frac{x^2}{2}(\\ln(x) - \\frac{1}{2}) + C_1",
      "\\text{Orthogonal Trajectory: } \\boxed{y^2 + x^2\\ln(x) = k}"
    ],
    generateOriginal: (params) => {
      return params.map(C => {
        return generatePoints(
          (t) => t > 0 ? { x: t, y: C * Math.log(t) } : null,
          C, 0.1, 10
        );
      });
    },
    generateOrthogonal: (params) => {
      return params.map(k => {
        if (k <= 0) return { x: [], y: [] };
        const a = Math.sqrt(k);
        const b = Math.sqrt(k / 2);
        return generatePoints(
          (t) => ({ x: a * Math.cos(t), y: b * Math.sin(t) }),
          k, 0, 2 * Math.PI
        );
      });
    }
  },
  {
    name: "Cubic curves",
    pattern: /y\s*=\s*[Cc]\s*x\^?3/i,
    original: "y = Cx³",
    orthogonal: "x² + 3y² = k",
    steps: [
      "\\text{Given family: } y = Cx^3",
      "\\text{Differentiate w.r.t. } x: \\quad \\frac{dy}{dx} = 3Cx^2",
      "\\text{From original equation: } C = \\frac{y}{x^3}",
      "\\text{Substitute: } \\frac{dy}{dx} = 3 \\cdot \\frac{y}{x^3} \\cdot x^2 = \\frac{3y}{x}",
      "\\text{For orthogonal trajectory: } \\frac{dy}{dx} = -\\frac{x}{3y}",
      "\\text{Rearranging: } 3y\\,dy = -x\\,dx",
      "\\text{Integrating: } \\frac{3y^2}{2} = -\\frac{x^2}{2} + C_1",
      "\\text{Orthogonal Trajectory: } \\boxed{x^2 + 3y^2 = k}"
    ],
    generateOriginal: (params) => {
      return params.map(C => {
        return generatePoints(
          (t) => ({ x: t, y: C * t * t * t }),
          C, -3, 3
        );
      });
    },
    generateOrthogonal: (params) => {
      return params.map(k => {
        if (k <= 0) return { x: [], y: [] };
        const a = Math.sqrt(k);
        const b = Math.sqrt(k / 3);
        return generatePoints(
          (t) => ({ x: a * Math.cos(t), y: b * Math.sin(t) }),
          k, 0, 2 * Math.PI
        );
      });
    }
  },
  {
    name: "Sine curves",
    pattern: /y\s*=\s*[Cc]\s*sin\s*\(?x\)?/i,
    original: "y = C·sin(x)",
    orthogonal: "y = k·cos(x)",
    steps: [
      "\\text{Given family: } y = C\\sin(x)",
      "\\text{Differentiate w.r.t. } x: \\quad \\frac{dy}{dx} = C\\cos(x)",
      "\\text{From original equation: } C = \\frac{y}{\\sin(x)}",
      "\\text{Substitute: } \\frac{dy}{dx} = \\frac{y\\cos(x)}{\\sin(x)} = y\\cot(x)",
      "\\text{For orthogonal trajectory: } \\frac{dy}{dx} = -\\frac{\\tan(x)}{y}",
      "\\text{Rearranging: } y\\,dy = -\\tan(x)\\,dx",
      "\\text{Integrating: } \\frac{y^2}{2} = \\ln|\\cos(x)| + C_1",
      "\\text{Orthogonal Trajectory: } \\boxed{y^2 = 2\\ln|\\cos(x)| + k}"
    ],
    generateOriginal: (params) => {
      return params.map(C => {
        return generatePoints(
          (t) => ({ x: t, y: C * Math.sin(t) }),
          C, -2 * Math.PI, 2 * Math.PI
        );
      });
    },
    generateOrthogonal: (params) => {
      const curves: { x: number[]; y: number[] }[] = [];
      params.forEach(k => {
        curves.push(generatePoints(
          (t) => {
            const cosT = Math.cos(t);
            if (cosT <= 0) return null;
            const val = 2 * Math.log(cosT) + k;
            if (val < 0) return null;
            return { x: t, y: Math.sqrt(val) };
          },
          k, -1.5, 1.5
        ));
        curves.push(generatePoints(
          (t) => {
            const cosT = Math.cos(t);
            if (cosT <= 0) return null;
            const val = 2 * Math.log(cosT) + k;
            if (val < 0) return null;
            return { x: t, y: -Math.sqrt(val) };
          },
          k, -1.5, 1.5
        ));
      });
      return curves;
    }
  }
];

export function findMatchingFamily(equation: string): CurveFamily | null {
  const normalized = equation.replace(/\s+/g, ' ').trim();
  
  for (const family of curveFamilies) {
    if (family.pattern.test(normalized)) {
      return family;
    }
  }
  
  return null;
}

export function getDefaultParams(): { original: number[]; orthogonal: number[] } {
  return {
    original: [-6, -4, -3, -2, -1, -0.5, 0.5, 1, 2, 3, 4, 6],
    orthogonal: [1, 2, 4, 6, 9, 12, 16, 20, 25, 30]
  };
}
