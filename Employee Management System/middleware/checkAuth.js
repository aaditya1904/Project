import express from "express";

const router = express.Router();

function checkAuth(req, res, next) {
    if (req.cookies.userId) 
        return next();
    res.redirect('/login');
}

export default checkAuth;