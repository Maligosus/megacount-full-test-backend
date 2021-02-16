import express,{Router} from 'express';
import { UserController } from '../controller/UserController';


const router:Router=express.Router();

router.post("/",UserController.loginUser);

router.post("/verify",UserController.verifyUser);

router.post("/registry",UserController.registryUser);

export default router;