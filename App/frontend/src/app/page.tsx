"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5] p-4 sm:p-8 font-sans text-slate-900 selection:bg-black selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1000px]"
      >
        <Card className="min-h-[600px] border-none rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] flex flex-col lg:flex-row overflow-hidden relative bg-white">
          {/* Left Half (Dark + Image) */}
          <div
            className="w-full lg:w-1/2 relative flex flex-col justify-center items-center p-12 text-center text-white overflow-hidden bg-center bg-cover"
            style={{ backgroundImage: `url('/drone.png')` }}
          >
            <div className="absolute inset-0 bg-black/85" />

            <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"></div>
              <span className="font-bold text-sm tracking-wide text-white">Trinetra OS</span>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
              }}
              className="relative z-10 flex flex-col items-center max-w-[340px] text-left lg:text-center lg:items-center w-full"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                className="text-white/20 mb-6 lg:self-center self-start"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
              </motion.div>

              <motion.h1
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                className="text-4xl lg:text-[40px] leading-[1.1] font-extrabold tracking-tight w-full text-white"
              >
                Trinetra<br />
                <span className="text-2xl mt-2 block font-bold text-white/90">Command Center</span>
              </motion.h1>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                className="text-[14px] text-slate-400 mt-6 leading-relaxed w-full font-medium"
              >
                Secure interface for tactical drone deployment, real-time monitoring, and emergency response coordination.
              </motion.p>
            </motion.div>

            <div className="absolute bottom-8 left-8 flex gap-6 text-[10px] font-mono tracking-widest text-slate-500 uppercase z-10">
              <span>PROTOCOL V4.2.0</span>
              <span>REGION: ALPHA</span>
            </div>
          </div>

          {/* Right Half (Light Form) */}
          <CardContent className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-14 relative z-10 bg-white m-0 border-none">

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="w-full max-w-[380px]"
            >
              <div className="mb-10 lg:text-left text-center">
                <h2 className="text-[32px] font-extrabold text-[#111] tracking-tight mb-2">Welcome back</h2>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">Enter your credentials to access your workspace.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2.5 group">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 pl-1 transition-colors group-focus-within:text-black">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="admin@Trinetra.com"
                      required
                      className="w-full bg-slate-50 border-gray-200 rounded-xl pl-12 pr-4 py-6 text-[15px] font-medium text-black placeholder:text-slate-400 focus-visible:ring-black/20 focus-visible:bg-white shadow-sm transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 group">
                  <div className="flex items-center justify-between pl-1 pr-1">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-black">
                      Password
                    </label>
                    <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-black transition-colors">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border-gray-200 rounded-xl pl-12 pr-4 py-6 text-[15px] font-medium text-black placeholder:text-slate-400 focus-visible:ring-black/20 focus-visible:bg-white shadow-sm transition-all duration-300"
                    />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black hover:bg-black/90 text-white rounded-xl h-14 text-[14px] font-bold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-center gap-2.5 group cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="flex items-center justify-between mt-10 mb-8">
                  <div className="border-t border-gray-200 flex-1"></div>
                  <span className="text-[10px] font-bold text-slate-400 px-4 uppercase tracking-[0.2em]">Or</span>
                  <div className="border-t border-gray-200 flex-1"></div>
                </div>

                <div className="text-center">
                  <span className="text-[13px] font-medium text-slate-500">
                    Don&apos;t have an account?{" "}
                    <a href="#" className="text-black font-bold hover:underline hover:text-gray-700 transition-colors">
                      Create one.
                    </a>
                  </span>
                </div>
              </form>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
