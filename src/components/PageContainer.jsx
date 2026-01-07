import { motion } from 'framer-motion';
import { Box } from '@mui/material';

// הגדרות האנימציה: איך הדף נכנס ויוצא
const pageVariants = {
  initial: { opacity: 0, y: 20 }, // התחלה: שקוף וקצת למטה
  animate: { opacity: 1, y: 0 },  // כניסה: נראה ועולה למקום
  exit: { opacity: 0, y: -20 }    // יציאה: נעלם למעלה
};

/**
 * רכיב זה עוטף כל דף באפליקציה ומעניק לו אנימציית כניסה חלקה.
 */
export default function PageContainer({ children, sx = {} }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ width: '100%', height: '100%' }}
    >
      <Box sx={sx}>
        {children}
      </Box>
    </motion.div>
  );
}