"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, ShoppingBag, Image as ImageIcon, Settings,
  MessageSquare, LayoutGrid, Hexagon, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainMenu = [
  { id: "dashboard", label: "Dashboard", icon: Map, href: "/dashboard" },
  { id: "api-marketplace", label: "API Market Place", icon: ShoppingBag, href: "/marketplace" },
  { id: "chatbot", label: "Chatbot", icon: MessageSquare, href: "/chatbot" },
  { id: "mission-images", label: "Mission Images", icon: ImageIcon, href: "/images" },
];

const systemMenu = [
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 96 : 280 }}
      className="h-screen flex flex-col relative z-20 shrink-0 bg-[#f4f4f5] transition-all duration-300 ease-in-out border-r border-transparent"
    >
      {/* Brand */}
      <div className="flex items-center px-8 h-28 shrink-0 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#888] hover:bg-white hover:shadow-sm hover:text-[#111] shrink-0 relative z-10 w-9 h-9 rounded-md transition-all"
        >
          <LayoutGrid className="w-5 h-5" />
        </Button>
        
        <AnimatePresence>
          {!isCollapsed && (
             <motion.div 
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }} 
               className="flex items-center gap-3 ml-4 overflow-hidden whitespace-nowrap absolute left-16"
             >
               <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[#111]">
                 <Hexagon className="w-3.5 h-3.5 text-white" />
               </div>
               <h1 className="text-[15px] font-bold tracking-tight text-[#111] font-sans">
                 Command AI
               </h1>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 py-4 px-6 space-y-8 overflow-y-auto overflow-x-hidden">
        {/* Main Menu */}
        <div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] font-bold tracking-[0.15em] text-[#999] uppercase mb-4 px-2"
              >
                Main Menu
              </motion.p>
            )}
          </AnimatePresence>

          <nav className="space-y-1">
            {mainMenu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.id === 'dashboard' && pathname === '/');
              return (
                <div key={item.id} className="relative group flex items-center">
                  <Button
                    onClick={() => router.push(item.href)}
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center py-6 rounded-full cursor-pointer transition-all duration-300 relative group overflow-hidden h-12",
                      isCollapsed ? "justify-center px-0" : "justify-start px-5 gap-4",
                      isActive 
                        ? "bg-[#111] text-white shadow-md hover:bg-black hover:text-white" 
                        : "bg-transparent text-[#666] hover:bg-white hover:text-[#111] font-medium hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#888] group-hover:text-[#111]"
                    )} />
                    <AnimatePresence>
                       {!isCollapsed && (
                         <motion.span 
                           initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                           className="text-[14px] font-semibold tracking-wide whitespace-nowrap"
                         >
                           {item.label}
                         </motion.span>
                       )}
                    </AnimatePresence>
                  </Button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* System Menu */}
        <div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] font-bold tracking-[0.15em] text-[#999] uppercase mb-4 px-2"
              >
                System
              </motion.p>
            )}
          </AnimatePresence>

          <nav className="space-y-1">
            {systemMenu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <div key={item.id} className="relative group flex items-center">
                  <Button
                    onClick={() => router.push(item.href)}
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center py-6 rounded-full cursor-pointer transition-all duration-300 relative group overflow-hidden h-12",
                      isCollapsed ? "justify-center px-0" : "justify-start px-5 gap-4",
                      isActive 
                        ? "bg-[#111] text-white shadow-md hover:bg-black hover:text-white" 
                        : "bg-transparent text-[#666] hover:bg-white hover:text-[#111] font-medium hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#888] group-hover:text-[#111]"
                    )} />
                    <AnimatePresence>
                       {!isCollapsed && (
                         <motion.span 
                           initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                           className="text-[14px] font-semibold tracking-wide whitespace-nowrap"
                         >
                           {item.label}
                         </motion.span>
                       )}
                    </AnimatePresence>
                  </Button>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Storage & Profile - Bottom */}
      <div className="p-6 pb-8">
        <AnimatePresence>
          {!isCollapsed ? (
             <motion.div
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
             >
                <div className="mb-4 px-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#888] mb-2 uppercase tracking-wide">
                    <span>Storage</span>
                    <span>79%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#111] w-[79%] rounded-full"></div>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-10 rounded-full bg-white border-transparent text-[#111] font-bold text-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  Upgrade
                </Button>
             </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
              <Button size="icon" className="w-10 h-10 rounded-full bg-white text-[#111] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-md cursor-pointer" title="Storage">
                <Database className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
