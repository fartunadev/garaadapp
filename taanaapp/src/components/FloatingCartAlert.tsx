import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FloatingCartAlert = () => {
  const { totalItems, subtotal, cartAnimating } = useCart();

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-20 right-4 z-50 md:bottom-6"
      >
        <Link to="/cart">
          <motion.div
            animate={cartAnimating ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Temu-style floating cart bubble */}
            <div className="flex flex-col items-center">
              {/* Cart badge with count */}
              <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full p-3 shadow-lg shadow-emerald-500/30">
                <ShoppingCart className="h-6 w-6 text-white" />
                
                {/* Count badge */}
                <motion.div
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                >
                  {totalItems}
                </motion.div>
                
                {/* Success checkmark animation when adding */}
                <AnimatePresence>
                  {cartAnimating && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2 -left-2 bg-white rounded-full p-1 shadow-md"
                    >
                      <Check className="h-3 w-3 text-emerald-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Cart label */}
              <span className="text-[10px] font-semibold text-emerald-600 mt-1">Cart</span>
              
              {/* "No import charges" label like Temu */}
              <div className="bg-emerald-100 text-emerald-700 text-[8px] font-medium px-2 py-0.5 rounded-full mt-0.5">
                Free shipping
              </div>
            </div>
            
            {/* Pulse effect when animating */}
            {cartAnimating && (
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                style={{ top: 0 }}
              />
            )}
          </motion.div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCartAlert;
