import express from "express";
import * as projectController from '../controller/project';
import { authenticateFirebaseUser } from "../../auth/middlewares/authenticateFirebaseUser";
import { validate } from "../../utils/validate";
import { ProjectSchema, ResourceSchema } from "../models/validate";

const route = express.Router()

route.post('/create', authenticateFirebaseUser, validate(ProjectSchema), async (req, res) => {
  try {
    const project = await projectController.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }

});

route.get('/getAll', authenticateFirebaseUser, async (req, res) => {
  try {
    const project = await projectController.getAllProjects();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.get('/getproject/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const project = await projectController.getProject(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.post('/allocate/:id', authenticateFirebaseUser, validate(ResourceSchema), async (req, res) => {
  try {
    const project = await projectController.allocateEmployeeToProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.patch('/edit/:id', authenticateFirebaseUser, validate(ProjectSchema.partial()), async (req, res) => {
  try {
    const project = await projectController.editProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.patch('/resources/:id', authenticateFirebaseUser, validate(ResourceSchema.partial()), async (req, res) => {
  try {
    const project = await projectController.editResources(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.delete('/delete/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const project = await projectController.deleteProject(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default route;
