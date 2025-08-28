
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BankStatementConverter from "@/components/BankStatementConverter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Shield, 
  Zap, 
  FileSpreadsheet,
  ArrowRight,
  FileText
} from "lucide-react";

const Index = () => {

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Processing",
      description: "Your bank statements are processed securely and never stored on our servers."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Lightning Fast",
      description: "Convert your PDFs to Excel in seconds with our optimized processing engine."
    },
    {
      icon: <FileSpreadsheet className="h-8 w-8 text-primary" />,
      title: "Perfect Formatting",
      description: "Get properly structured Excel files with correct column mapping and formatting."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary-glow/5" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                The world's most trusted{" "}
                <span className="gradient-text">bank statement converter</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Easily convert PDF bank statements from 1000s of banks world wide into clean Excel (XLS) format.
              </p>

              {/* PDF Converter Component */}
              <div className="max-w-4xl mx-auto mb-12">
                <BankStatementConverter />
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Our Converter?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built with cutting-edge technology to deliver the most accurate 
                bank statement conversion experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="card-gradient text-center">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground">
                Simple 3-step process to convert your bank statements
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Upload PDF",
                  description: "Select and upload your bank statement PDF file",
                  icon: <FileText className="h-8 w-8" />
                },
                {
                  step: "2", 
                  title: "AI Processing",
                  description: "Our AI extracts and structures your transaction data",
                  icon: <Zap className="h-8 w-8" />
                },
                {
                  step: "3",
                  title: "Download Excel",
                  description: "Get your perfectly formatted Excel file instantly",
                  icon: <FileSpreadsheet className="h-8 w-8" />
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <div className="mb-4 text-primary">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  
                  {index < 2 && (
                    <ArrowRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-muted-foreground">
                Choose the plan that works for you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Anonymous */}
              <Card className="card-gradient text-center relative">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-2">Anonymous</h3>
                  <p className="text-muted-foreground mb-4">
                    Anonymous conversions with no need to sign up
                  </p>
                  <div className="text-3xl font-bold mb-4">Free</div>
                  <ul className="space-y-2 text-sm mb-6">
                    <li>✓ 1 page every 24 hours</li>
                    <li>✓ No registration required</li>
                    <li>✓ Secure processing</li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    Start Converting
                  </Button>
                </CardContent>
              </Card>

              {/* Registered */}
              <Card className="card-gradient text-center relative border-primary border-2">
                <CardContent className="p-8">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Registered</h3>
                  <p className="text-muted-foreground mb-4">
                    Registration is free
                  </p>
                  <div className="text-3xl font-bold mb-4">Free</div>
                  <ul className="space-y-2 text-sm mb-6">
                    <li>✓ 5 pages every 24 hours</li>
                    <li>✓ Free registration</li>
                    <li>✓ Priority processing</li>
                    <li>✓ Conversion history</li>
                  </ul>
                  <Button variant="glow" className="w-full">
                    Register Now
                  </Button>
                </CardContent>
              </Card>

              {/* Subscribe */}
              <Card className="card-gradient text-center relative">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-2">Subscribe</h3>
                  <p className="text-muted-foreground mb-4">
                    Subscribe to convert more documents
                  </p>
                  <div className="text-3xl font-bold mb-4">$9.99<span className="text-sm text-muted-foreground">/mo</span></div>
                  <ul className="space-y-2 text-sm mb-6">
                    <li>✓ Unlimited conversions</li>
                    <li>✓ Premium support</li>
                    <li>✓ Bulk processing</li>
                    <li>✓ API access</li>
                  </ul>
                  <Button variant="hero" className="w-full">
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
