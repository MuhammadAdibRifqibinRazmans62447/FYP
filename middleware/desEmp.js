const EmpdeserializeUser = (req, res, next) => {
  console.log('Session user emp:', req.session.user1);

  if (req.session.user1 && req.session.user1.role === 'employee') {
      const { id, role } = req.session.user1; // Corrected to use req.session.user1
      console.log('Session user emp2:', req.session.user1);

      req.user1 = {
          id: id,
          role: role,
          // Add other employee-specific properties if needed
      };

      next();
  } else {
      // Handle unauthorized or no session user
      req.user1 = null;
      next();
  }
};

module.exports = EmpdeserializeUser;
