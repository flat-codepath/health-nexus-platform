import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Shield, BarChart3, Users, ArrowRight, CheckCircle2, Activity, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const features = [
  { icon: Building2, title: 'Multi-Branch Management', desc: 'Manage unlimited branches from a single dashboard with unified analytics and reporting.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Granular permissions for owners, admins, doctors, and staff with secure tenant isolation.' },
  { icon: Activity, title: 'Real-Time Patient Flow', desc: 'Track patient journeys across branches with a unified medical history accessible everywhere.' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Revenue trends, bed occupancy, patient flow — actionable insights at every level.' },
  { icon: Shield, title: 'HIPAA Compliant', desc: 'Enterprise-grade security with end-to-end encryption and comprehensive audit trails.' },
  { icon: Globe, title: 'Cloud Native', desc: 'Scalable infrastructure that grows with your hospital network. 99.9% uptime guaranteed.' },
];

const stats = [
  { value: '500+', label: 'Hospitals' },
  { value: '2M+', label: 'Patients Managed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '15+', label: 'Countries' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Activity className="h-6 w-6 text-primary" />
            <span>MedFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Why Us</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-gradient opacity-90" />
        </div>
        <div className="relative container mx-auto px-6 py-28 md:py-40">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/80 mb-6">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
              Now serving 500+ hospitals worldwide
            </motion.div>
            <motion.h1 custom={1} variants={fadeUp} className="text-4xl md:text-6xl font-bold tracking-tight text-primary-foreground leading-[1.1] mb-6">
              Multi-Branch Hospital Management,{' '}
              <span className="text-gradient">Simplified.</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mb-8 leading-relaxed">
              The enterprise platform that unifies patient care, operations, and analytics
              across your entire hospital network. One system, every branch, total control.
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base px-8" asChild>
                <Link to="/register">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="#features">See How It Works</Link>
              </Button>
            </motion.div>
            <motion.div custom={4} variants={fadeUp} className="flex items-center gap-6 mt-8 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> 14-day free trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> HIPAA compliant</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 border-b">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything Your Hospital Network Needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for multi-branch healthcare organizations that demand reliability, security, and scalability.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="stat-card group"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Hospital Network?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-xl mx-auto">
              Join 500+ hospitals managing their operations effortlessly with MedFlow.
            </p>
            <Button size="lg" className="text-base px-10" asChild>
              <Link to="/register">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Activity className="h-5 w-5 text-primary" />
            MedFlow
          </div>
          <p className="text-sm text-muted-foreground">© 2025 MedFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
