import express from "express";
import * as payslipComponent from '../controller/payslip'
import { authenticateFirebaseUser } from "../../../auth/middlewares/authenticateFirebaseUser";


const route = express.Router()

route.post('/addDefault', authenticateFirebaseUser, async (req, res) => {
    try {
        const component = await payslipComponent.addDefaultComponent(req.body)
        res.json(component);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

route.post('/structure', authenticateFirebaseUser, async (req, res) => {
    try {
        const component = await payslipComponent.addStructure(req.body)
        res.json(component);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

route.post('/addComponent/:id', authenticateFirebaseUser, async (req, res) => {
    try {
        const component = await payslipComponent.addComponent(req.body, req.params.id)
        res.json(component);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

route.get('/structure', authenticateFirebaseUser, async (req, res) => {
    try {
        const structures = await payslipComponent.getAllStructure()
        res.json(structures);
    }
    catch (error) {
        res.status(400).json({ error: (error as Error).message });

    }
})

route.patch('/structure/:id', authenticateFirebaseUser, async (req, res) => {
    try {
        const structures = await payslipComponent.editStructure(req.params.id,req.body)
        res.json(structures);
    }
    catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
})

route.get('/component/:id',authenticateFirebaseUser,async(req,res)=>{
    try {
        const component = await payslipComponent.getComponent(req.params.id)
        res.json(component);
    }
    catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
})

route.patch('/component/:id', authenticateFirebaseUser, async (req, res) => {
    try {
        const structures = await payslipComponent.editComponent(req.params.id,req.body)
        res.json(structures);
    }
    catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
})

route.delete('/component/:id', authenticateFirebaseUser, async (req, res) => {
    try {
        const structures = await payslipComponent.deleteComponent(req.params.id)
        res.json(structures);
    }
    catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
})

route.delete('/structure/:id', authenticateFirebaseUser, async (req, res) => {
    try {
        const structures = await payslipComponent.deleteStructure(req.params.id)
        res.json(structures);
    }
    catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
})

export default route;