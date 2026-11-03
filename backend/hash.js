const bcrypt = require('bcryptjs');

(async () => {
  const passwords = ['admin123', 'director123', 'maestro123'];
  
  for (const pass of passwords) {
    const hash = await bcrypt.hash(pass, 10);
    console.log(pass, '=>', hash);
  }
})();