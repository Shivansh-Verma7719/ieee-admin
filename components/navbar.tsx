"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, useTransform, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import IEEELogo from "@/public/images/logo.png";
import { getPages } from "./pages";

const CustomNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const pages = getPages();
  

  return (
    <motion.header
      style={{ opacity: headerOpacity }}
      className="fixed top-0 left-0 right-0 z-50 bg-background text-text bg-opacity-90 backdrop-blur-sm shadow-sm"
    >
      <nav className="container mx-auto px-4 sm:px-6 py-2">
        <div className="flex justify-between items-center">
          <a href="/">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-row items-center justify-center"
            >
              <Image
                src={IEEELogo}
                alt="Quratr logo"
                width={50}
                height={50}
              />
            </motion.div>
          </a>
          <div className="hidden md:flex space-x-1">
            {pages.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-lg px-3 py-1 rounded-md font-semibold transition-colors relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-black origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </nav>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white py-4 border-t border-gray-100"
        >
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            {pages.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-semibold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default CustomNavbar;
