import React, { useEffect, useState } from "react";

import { Link, useLocation } from "wouter";
// import { loginSchema, type LoginUser } from "@shared/schema";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../context/auth-context";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import FacebookLoginButton from "../../components/auth/facebook-login";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, login, isLoading } = useAuth();
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to Sentiment Analyzer",
      });
      setLocation("/dashboard");
    }
  }, [user]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
      transition={{ duration: 0.6 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white p-4"
    >
      <motion.div
        variants={fadeIn}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <motion.div
          variants={fadeIn}
          transition={{ delay: 0.3 }}
          className="text-center space-y-3"
        >
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sentiment Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Comments Sentiment Analysis Platform
          </p>
          <div className="mt-4 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FacebookLoginButton onLogin={login} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
