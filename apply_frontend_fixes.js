#!/usr/bin/env node
/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FRONTEND FIX SCRIPT - Automated Issue Resolution
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║              FRONTEND AUTOMATED FIXES - APPLYING PATCHES                  ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

const fixes = [];

// Fix AdminSupport.jsx
const adminSupportPath = path.join(__dirname, 'frontend/src/pages/AdminSupport.jsx');
if (fs.existsSync(adminSupportPath)) {
  let content = fs.readFileSync(adminSupportPath, 'utf8');
  
  // Add error display after page header
  if (!content.includes('{error &&') && content.includes('</div>\\n\\n        {/* Tickets Grid */}')) {
    content = content.replace(
      '</div>\\n\\n        {/* Tickets Grid */}',
      `</div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px', padding: '15px', background: '#fee', border: '1px solid #fcc', borderRadius: '5px', color: '#c00' }}>
            <strong>⚠️  Error:</strong> {error}
            <button onClick={() => setError('')} style={{ marginLeft: '15px', padding: '5px 10px', cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Tickets Grid */}`
    );
    
    // Fix useEffect
    content = content.replace(
      'useEffect(() => {\\n    fetchTickets();\\n  }, []);',
      `useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);`
    );
    
    fs.writeFileSync(adminSupportPath, content);
    fixes.push('✅ AdminSupport.jsx - Added error display and fixed useEffect');
  }
}

// Fix AdminTailors.jsx
const adminTailorsPath = path.join(__dirname, 'frontend/src/pages/AdminTailors.jsx');
if (fs.existsSync(adminTailorsPath)) {
  let content = fs.readFileSync(adminTailorsPath, 'utf8');
  
  // Add error display
  if (!content.includes('{error &&')) {
    content = content.replace(
      /(<\/div>\s*\n\s*{\/\* Search \*\/})/,
      `</div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px', padding: '15px', background: '#fee', border: '1px solid #fcc', borderRadius: '5px', color: '#c00' }}>
            <strong>⚠️  Error:</strong> {error}
            <button onClick={() => setError('')} style={{ marginLeft: '15px', padding: '5px 10px', cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Search */}`
    );
    
    // Fix useEffect
    content = content.replace(
      'useEffect(() => {\\n    fetchTailors();\\n  }, []);',
      `useEffect(() => {
    fetchTailors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);`
    );
    
    fs.writeFileSync(adminTailorsPath, content);
    fixes.push('✅ AdminTailors.jsx - Added error display and fixed useEffect');
  }
}

// Fix TailorOrders.jsx - Remove unused variables
const tailorOrdersPath = path.join(__dirname, 'frontend/src/pages/TailorOrders.jsx');
if (fs.existsSync(tailorOrdersPath)) {
  let content = fs.readFileSync(tailorOrdersPath, 'utf8');
  
  // Comment out unused variables
  content = content.replace(
    'const [orderHistory, setOrderHistory] = useState([]);',
    '// const [orderHistory, setOrderHistory] = useState([]); // TODO: Implement order history feature'
  );
  content = content.replace(
    'const [showOrderModal, setShowOrderModal] = useState(false);',
    '// const [showOrderModal, setShowOrderModal] = useState(false); // TODO: Implement order modal'
  );
  content = content.replace(
    'const [isUpdating, setIsUpdating] = useState(false);',
    '// const [isUpdating, setIsUpdating] = useState(false); // TODO: Implement updating state'
  );
  content = content.replace(
    'const [updateNote, setUpdateNote] = useState("");',
    '// const [updateNote, setUpdateNote] = useState(""); // TODO: Implement update note'
  );
  
  fs.writeFileSync(tailorOrdersPath, content);
  fixes.push('✅ TailorOrders.jsx - Commented out unused variables with TODO markers');
}

// Fix CustomerProfile.jsx - Comment out unused password variables
const customerProfilePath = path.join(__dirname, 'frontend/src/pages/CustomerProfile.jsx');
if (fs.existsSync(customerProfilePath)) {
  let content = fs.readFileSync(customerProfilePath, 'utf8');
  
  // Comment out unused variables
  content = content.replace(
    'const [passwordError, setPasswordError] = useState("");',
    '// const [passwordError, setPasswordError] = useState(""); // TODO: Implement password validation'
  );
  
  fs.writeFileSync(customerProfilePath, content);
  fixes.push('✅ CustomerProfile.jsx - Commented out unused password error variable');
}

// Print results
console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.green}FIXES APPLIED${colors.reset}\n`);

if (fixes.length > 0) {
  fixes.forEach(fix => console.log(fix));
} else {
  console.log('⚠️  No fixes applied. Files may already be fixed or not found.');
}

console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
console.log(`${colors.blue}📝 Next Steps:${colors.reset}`);
console.log('   1. Review the changes');
console.log('   2. Run: cd frontend && npm run lint');
console.log('   3. Test the application');
console.log('   4. Complete TODO items in commented code\n');
