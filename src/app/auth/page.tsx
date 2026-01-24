"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2, Mail, Lock, User, Loader2, ArrowRight, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const isConfigured = isSupabaseConfigured();
  const supabase = useMemo(
    () => (isConfigured ? createClient() : null),
    [isConfigured]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/learn");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

// Show setup instructions if Supabase is not configured
  if (!isConfigured) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center shadow-glow-gold mb-4">
              <Music2 className="w-8 h-8 text-black" />
            </div>
            <h1 className="font-serif text-3xl font-bold gradient-gold-text">
              Sounds Good
            </h1>
          </div>

          <Card className="bg-card/50 border-border backdrop-blur">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-gold" />
              </div>
              <CardTitle className="font-serif text-xl">Setup Required</CardTitle>
              <CardDescription>
                Authentication requires Supabase configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-3">
                <p>To enable authentication and progress tracking:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Create a free Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">supabase.com</a></li>
                  <li>Run the SQL schema from <code className="px-1 py-0.5 bg-secondary rounded">supabase-schema.sql</code></li>
                  <li>Copy your project URL and anon key from Settings &gt; API</li>
                  <li>Update <code className="px-1 py-0.5 bg-secondary rounded">.env.local</code> with your credentials</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center shadow-glow-gold mb-4">
            <Music2 className="w-8 h-8 text-black" />
          </div>
          <h1 className="font-serif text-3xl font-bold gradient-gold-text">
            Sounds Good
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? "Start your piano journey" : "Welcome back"}
          </p>
        </div>

        <Card className="bg-card/50 border-border backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-xl">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Join thousands learning piano"
                : "Continue your learning journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {message && (
                <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-lg">
                  {message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full gradient-gold text-black hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="text-gold hover:underline font-medium"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
