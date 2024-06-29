// middleware/deserializeUser.js

const deserializeUser = (req, res, next) => {
  console.log('Session user cust:', req.session.user);
  if (req.session.user && req.session.user.role === 'customer') {
    // Assuming session user object has id and role properties
    console.log('Session user cust2:', req.session.user);
    const { id, role } = req.session.user;

    req.user = {
        id: id,
        role: role,
        // Add other customer-specific properties if needed
    };

    next();
} else {
    // Handle unauthorized or no session user
    req.user = null;
    next();
}
};

module.exports = deserializeUser;
