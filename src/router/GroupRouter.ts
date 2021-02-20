import express,{Router} from 'express';
import router from './UserRouter';
import { AuthMiddleware,checkUserRole } from '../middlewares/user-middleware';
import { GroupController } from '../controller/GroupController';
import { UserRoleConstants } from '../interfaces/UserRole';
import {checkGroupOwnerMiddleWare } from '../middlewares/group-middleware';

const roter:Router=express.Router();


router.use(AuthMiddleware);

router.get("/owner/:ownerId",GroupController.getGroupsByOwner);

router.post("/create",GroupController.createGroupByUser);

router.post("/delete/current",checkGroupOwnerMiddleWare,GroupController.deleteUserGroup);

router.post("/enter",GroupController.enterUserToGroup);

router.post("/leave",GroupController.leaveUserFromGroup);

router.get("/:groupId/members",GroupController.getAllGroupMembers);

router.get("/all",GroupController.getAllGroups);

export default router;
