"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Music2,
  Piano,
  BookOpen,
  PenTool,
  Play,
  Check,
  ArrowRight,
  Star,
  Mic2,
  Headphones,
  BarChart3,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <Music2 className="w-5 h-5 text-background" />
              </div>
              <span className="font-serif text-xl font-semibold tracking-tight">
                Sounds Good
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#curriculum"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Curriculum
              </a>
              <a
                href="#testimonials"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Our Mission
              </a>
            </div>

            <div className="flex items-center gap-4">
              <ModeToggle />
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  size="sm"
                  className="gradient-gold text-background hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1
              variants={fadeInUp}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Master the Piano with{" "}
              <span className="gradient-gold-text text-shadow-gold">
                World-Class
              </span>{" "}
              Instruction
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Transform your musical journey with interactive lessons, real-time
              MIDI feedback, and a comprehensive curriculum designed by expert
              educators.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth">
                <Button
                  size="lg"
                  className="gradient-gold text-background hover:opacity-90 transition-opacity glow-gold-sm text-lg px-8 py-6"
                >
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/free-play">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Try Free Play
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>MIDI support included</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Free forever</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <InteractiveDemo />
            {/* Decorative glow */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-3xl bg-primary/20" />
          </motion.div>
        </div>
      </section>

      {/* Trusted By / Social Proof Bar */}
      <section className="py-12 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by musicians and educators worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-60">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="font-medium">50+ Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">ABRSM Aligned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Features
            </Badge>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-gold-text">Excel</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From beginner fundamentals to advanced techniques, our platform
              provides comprehensive tools for every stage of your musical
              journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Piano,
                title: "Interactive Piano",
                description:
                  "Practice with our responsive virtual keyboard or connect your MIDI device for real-time feedback and assessment.",
                gradient: "from-primary/20 to-primary/5",
              },
              {
                icon: BookOpen,
                title: "Structured Curriculum",
                description:
                  "Follow our ABRSM-aligned progression from complete beginner through Grade 8, with clear milestones and achievements.",
                gradient: "from-indigo-500/20 to-indigo-500/5",
              },
              {
                icon: Mic2,
                title: "Music Theory Tools",
                description:
                  "Visualize scales, chords, intervals, and the circle of fifths with our interactive theory learning modules.",
                gradient: "from-emerald-500/20 to-emerald-500/5",
              },
              {
                icon: Play,
                title: "Song Learning",
                description:
                  "Learn your favorite songs with falling notes visualization, adjustable tempo, and hands-separate practice modes.",
                gradient: "from-rose-500/20 to-rose-500/5",
              },
              {
                icon: PenTool,
                title: "Sheet Music Composer",
                description:
                  "Create and edit sheet music with our intuitive composer. Upload PDFs and let AI transcribe them automatically.",
                gradient: "from-amber-500/20 to-amber-500/5",
              },
              {
                icon: Zap,
                title: "Progress Tracking",
                description:
                  "Monitor your improvement with detailed analytics, practice streaks, and personalized recommendations.",
                gradient: "from-cyan-500/20 to-cyan-500/5",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-strong h-full hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 group">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section
        id="curriculum"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Curriculum
              </Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
                A Clear Path from{" "}
                <span className="gradient-gold-text">Beginner to Expert</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our curriculum follows the internationally recognized ABRSM
                grading system, ensuring you build a solid foundation and
                progress systematically.
              </p>

              <div className="space-y-4">
                {[
                  {
                    level: "Beginner",
                    grades: "Grades 1-2",
                    topics: "Basic notation, simple melodies, hand position",
                  },
                  {
                    level: "Elementary",
                    grades: "Grades 3-4",
                    topics: "Scales, arpeggios, dynamic expression",
                  },
                  {
                    level: "Intermediate",
                    grades: "Grades 5-6",
                    topics: "Complex rhythms, chord progressions, pedaling",
                  },
                  {
                    level: "Advanced",
                    grades: "Grades 7-8",
                    topics: "Performance repertoire, interpretation, technique",
                  },
                ].map((item, i) => (
                  <div
                    key={item.level}
                    className="flex items-start gap-4 p-4 rounded-xl glass hover:glass-strong transition-all"
                  >
                    <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shrink-0">
                      <span className="text-background font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.level}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.grades}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.topics}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-strong rounded-2xl p-8 shadow-premium-lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h3 className="font-serif text-lg">Your Progress</h3>
                    <Badge>Grade 3</Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Scales & Arpeggios</span>
                        <span className="text-primary">85%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-gold rounded-full"
                          style={{ width: "85%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Sight Reading</span>
                        <span className="text-primary">60%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-gold rounded-full"
                          style={{ width: "60%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Music Theory</span>
                        <span className="text-primary">92%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-gold rounded-full"
                          style={{ width: "92%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold text-primary">127</p>
                      <p className="text-xs text-muted-foreground">
                        Lessons Done
                      </p>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold text-primary">23</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold text-primary">48h</p>
                      <p className="text-xs text-muted-foreground">
                        Practice Time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 blur-2xl bg-primary/20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Testimonials
            </Badge>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              Loved by <span className="gradient-gold-text">Musicians</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who have transformed their piano skills
              with Sounds Good.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "The interactive lessons and MIDI integration make practicing so much more engaging. I've improved more in 3 months than in years of traditional lessons.",
                author: "Sarah Chen",
                role: "Adult Learner",
                rating: 5,
              },
              {
                quote:
                  "As a piano teacher, I recommend Sounds Good to all my students. The curriculum is well-structured and the progress tracking helps me monitor their practice.",
                author: "Michael Roberts",
                role: "Piano Instructor",
                rating: 5,
              },
              {
                quote:
                  "The AI sheet music transcription is a game-changer. I can upload any PDF and start learning immediately. Can't believe this is completely free!",
                author: "Emma Thompson",
                role: "Music Student",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-strong h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                        <span className="text-background font-semibold">
                          {testimonial.author[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Forever Section */}
      <section
        id="pricing"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              100% Free
            </Badge>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              Completely <span className="gradient-gold-text">Free</span>{" "}
              Forever
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe music education should be accessible to everyone.
              That&apos;s why Sounds Good is completely free—no trials, no tiers, no hidden costs.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="glass-strong border-primary/50 shadow-premium-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Badge className="gradient-gold text-background">
                      Lifetime Access
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">Everything Included</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold gradient-gold-text">$0</span>
                    <span className="text-muted-foreground ml-2">forever</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      "Interactive virtual keyboard",
                      "Unlimited lessons & courses",
                      "MIDI device support",
                      "Full music theory toolkit",
                      "Song learning mode",
                      "Progress tracking & analytics",
                      "AI sheet music transcription",
                      "Composition & export tools",
                      "ABRSM-aligned curriculum",
                      "Community access",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/auth" className="block pt-4">
                    <Button className="w-full gradient-gold text-background hover:opacity-90 text-lg py-6">
                      Start Learning Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-muted-foreground">
                    No credit card required. No strings attached.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Why Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center max-w-2xl mx-auto"
          >
            <h3 className="font-serif text-2xl font-semibold mb-4">
              Why is Sounds Good free?
            </h3>
            <p className="text-muted-foreground">
              We&apos;re passionate about making quality music education accessible to everyone,
              regardless of their financial situation. Our mission is to help people discover
              the joy of playing piano, not to maximize profits.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-premium opacity-50" />
            <div className="relative z-10">
              <Headphones className="w-12 h-12 mx-auto mb-6 text-primary" />
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
                Ready to Start Your Musical Journey?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of students mastering piano with Sounds Good.
                Your first lesson is free.
              </p>
              <Link href="/auth">
                <Button
                  size="lg"
                  className="gradient-gold text-background hover:opacity-90 glow-gold text-lg px-10 py-6"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-background" />
                </div>
                <span className="font-serif text-xl font-semibold">
                  Sounds Good
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Premium piano education for the modern musician.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#curriculum" className="hover:text-foreground">
                    Curriculum
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground">
                    Our Mission
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Sounds Good. All rights
              reserved.
            </p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Secure & encrypted
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
