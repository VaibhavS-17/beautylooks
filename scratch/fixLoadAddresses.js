const fs = require('fs');

const pageFile = 'src/app/checkout/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf-8');

// Move loadSavedAddresses out of useEffect
const useEffectRe = /  \/\/ Load saved addresses\r?\n  useEffect\(\(\) => \{\r?\n    async function loadSavedAddresses\(\) \{[\s\S]*?    \}\r?\n    loadSavedAddresses\(\);\r?\n  \}, \[\]\);\r?\n/m;

if (useEffectRe.test(pageContent)) {
  const newLoadAddresses = `  // Load saved addresses
  const loadSavedAddresses = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoggedIn(false); setAddressesLoading(false); return; }
      setIsLoggedIn(true);
      if (user.email) setFormData(prev => ({ ...prev, email: user.email! }));
      const { data: addresses } = await supabase
        .from('addresses').select('*').eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (addresses && addresses.length > 0) setSavedAddresses(addresses);
    } catch (err) { console.error('Failed to load addresses:', err); }
    finally { setAddressesLoading(false); }
  };

  useEffect(() => {
    loadSavedAddresses();
  }, []);\n`;

  pageContent = pageContent.replace(useEffectRe, newLoadAddresses);
  console.log('Moved loadSavedAddresses out of useEffect');
} else {
  console.log('Could not find useEffect for loadSavedAddresses');
}

// Replace loadAddresses() with loadSavedAddresses()
const loadAddressesRe = /              await loadAddresses\(\);\r?\n/m;
if (loadAddressesRe.test(pageContent)) {
  pageContent = pageContent.replace(loadAddressesRe, '              await loadSavedAddresses();\n');
  console.log('Replaced loadAddresses with loadSavedAddresses');
} else {
  console.log('Could not find loadAddresses()');
}

fs.writeFileSync(pageFile, pageContent);
console.log('Done.');
