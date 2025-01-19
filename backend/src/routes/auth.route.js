import express from "express";
import {login,signup,logout,updateProfile,checkAuth,deleteProfile,downloadFlag} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router=express.Router();

router.post("/signup",signup);

router.post("/login",login);

router.post("/logout",logout);

router.put("/update-profile",protectRoute,updateProfile);

router.put("/update-download-flag",protectRoute,downloadFlag);

router.delete("/delete-profile",protectRoute,deleteProfile);

router.get("/check",protectRoute,checkAuth);

export default router;