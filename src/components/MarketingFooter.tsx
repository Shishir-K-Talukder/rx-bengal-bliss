import { Link } from "react-router-dom";

const MarketingFooter = () => (
  <footer className="border-t border-border/40 bg-muted/20 mt-20">
    <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <span className="text-base font-serif italic text-primary-foreground font-bold">℞</span>
          </div>
          <span className="font-bold text-foreground">Digital Rx</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bangladesh's modern digital prescription platform for doctors.
        </p>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-3">Product</h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li><a href="/#features" className="hover:text-foreground">Features</a></li>
          <li><a href="/#pricing" className="hover:text-foreground">Pricing</a></li>
          <li><Link to="/login" className="hover:text-foreground">Login</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-3">Company</h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li><Link to="/about" className="hover:text-foreground">About</Link></li>
          <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-3">Legal</h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li>Privacy Policy</li>
          <li>Terms of Service</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Digital Rx. All rights reserved.
    </div>
  </footer>
);

export default MarketingFooter;
