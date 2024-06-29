const MngdeserializeUser = (req, res, next) => {
  console.log('Session user mng:', req.session.user2);

  if (req.session.user2 && req.session.user2.role === 'manager') {
      const { id, role } = req.session.user2; // Corrected to use req.session.user1
      console.log('Session user mng2:', req.session.user2);

      req.user2 = {
          id: id,
          role: role,
          // Add other employee-specific properties if needed
      };

      next();
  } else {
      // Handle unauthorized or no session user
      req.user2 = null;
      next();
  }
  };
  
  module.exports = MngdeserializeUser;