import { useState } from "react";
import { Leaf, Calculator, Fuel, Zap, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryCard } from "@/components/CategoryCard";
import { SavingTips } from "@/components/SavingTips";
import { FUEL_EMISSION_FACTORS, calculateEmissions, getSavingTips, EmissionResult } from "@/lib/emissions";
import natureBg from "@/assets/nature-bg.jpg";

const CarbonCalculator = () => {
  const [fuelType, setFuelType] = useState<string>("petrol");
  const [fuelAmount, setFuelAmount] = useState<string>("");
  const [electricity, setElectricity] = useState<string>("");
  const [waste, setWaste] = useState<string>("");
  const [result, setResult] = useState<EmissionResult | null>(null);

  const handleCalculate = () => {
    const emissions = calculateEmissions(
      fuelType,
      parseFloat(fuelAmount) || 0,
      parseFloat(electricity) || 0,
      parseFloat(waste) || 0
    );
    setResult(emissions);
  };

  const handleReset = () => {
    setFuelType("petrol");
    setFuelAmount("");
    setElectricity("");
    setWaste("");
    setResult(null);
  };

  const selectedFuel = FUEL_EMISSION_FACTORS[fuelType];

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${natureBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Eco Calculator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Carbon Footprint <span className="text-gradient">Calculator</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Calculate your monthly carbon emissions from fuel, electricity, and waste. 
            Get personalized tips to reduce your environmental impact.
          </p>
        </header>

        {/* Main Calculator Card */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-6 md:p-8 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl nature-gradient">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Monthly Emissions</h2>
                <p className="text-sm text-muted-foreground">Enter your consumption data</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Fuel Section */}
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-4">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Fuel className="w-4 h-4 text-amber-600" />
                  Fuel Consumption
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuelType" className="text-muted-foreground">Fuel Type</Label>
                    <Select value={fuelType} onValueChange={setFuelType}>
                      <SelectTrigger id="fuelType" className="bg-card/80">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FUEL_EMISSION_FACTORS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Emission factor: {selectedFuel?.factor} kg CO₂/{selectedFuel?.unit}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fuelAmount" className="text-muted-foreground">
                      Amount ({selectedFuel?.unit})
                    </Label>
                    <Input
                      id="fuelAmount"
                      type="number"
                      placeholder={`Enter ${selectedFuel?.unit} used`}
                      value={fuelAmount}
                      onChange={(e) => setFuelAmount(e.target.value)}
                      className="bg-card/80"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Electricity Section */}
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-4">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Electricity Usage
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="electricity" className="text-muted-foreground">Monthly kWh</Label>
                  <Input
                    id="electricity"
                    type="number"
                    placeholder="Enter kWh consumed"
                    value={electricity}
                    onChange={(e) => setElectricity(e.target.value)}
                    className="bg-card/80"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Emission factor: 0.5 kg CO₂/kWh
                  </p>
                </div>
              </div>

              {/* Waste Section */}
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-4">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Trash2 className="w-4 h-4 text-emerald-600" />
                  Waste Generated
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="waste" className="text-muted-foreground">Monthly waste (kg)</Label>
                  <Input
                    id="waste"
                    type="number"
                    placeholder="Enter kg of waste"
                    value={waste}
                    onChange={(e) => setWaste(e.target.value)}
                    className="bg-card/80"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Emission factor: 0.5 kg CO₂/kg waste
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleCalculate}
                  className="flex-1 nature-gradient hover:opacity-90 text-primary-foreground font-medium"
                >
                  Calculate Emissions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="bg-card/50 hover:bg-card/80"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {result && result.total > 0 && (
            <div className="mt-6 glass-card rounded-2xl p-6 md:p-8 animate-fade-in">
              <h3 className="text-xl font-semibold text-foreground mb-2">Your Carbon Footprint</h3>
              <p className="text-muted-foreground mb-6">
                Your total monthly emissions are{" "}
                <span className="text-2xl font-bold text-primary">{result.total.toFixed(2)} kg CO₂</span>
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <CategoryCard
                  icon={Fuel}
                  title="Fuel"
                  emission={result.fuel}
                  isHighest={result.highestCategory === "fuel"}
                  color="fuel"
                />
                <CategoryCard
                  icon={Zap}
                  title="Electricity"
                  emission={result.electricity}
                  isHighest={result.highestCategory === "electricity"}
                  color="electricity"
                />
                <CategoryCard
                  icon={Trash2}
                  title="Waste"
                  emission={result.waste}
                  isHighest={result.highestCategory === "waste"}
                  color="waste"
                />
              </div>

              {/* Saving Tips */}
              <SavingTips 
                tips={getSavingTips(result.highestCategory)} 
                category={result.highestCategory} 
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>🌱 Every small step counts towards a greener planet</p>
        </footer>
      </div>
    </div>
  );
};

export default CarbonCalculator;
