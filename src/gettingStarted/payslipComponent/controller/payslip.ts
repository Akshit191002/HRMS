import admin from '../../../firebase';
import { Component, SalaryStructure } from '../module/payslip';
import logger from '../../../utils/logger';
const db = admin.firestore();

const componentCollection = db.collection('components');
const salaryCollection = db.collection('salaryStructures');

export const addStructure = async (structureData: SalaryStructure) => {
    try {
        logger.info(`Adding new salary structure`, { structureData });

        const structureRef = salaryCollection.doc();
        const defaultSnap = await componentCollection.where("isDefault", "==", true).get();
        const defaultComponents = defaultSnap.docs.map((doc) => doc.id);

        const structure: SalaryStructure = {
            ...structureData,
            id: structureRef.id,
            salaryComponent: defaultComponents,
            isDeleted: false
        };

        await structureRef.set(structure);
        logger.info(`Salary structure created successfully`, { id: structureRef.id });

        return structure;
    } catch (error) {
        logger.error(`Failed to add salary structure`, { error });
        throw error;
    }
};

export const addComponent = async (data: Component, groupId: string) => {
    try {
        logger.info(`Adding component to group ${groupId}`, { data });

        const newCompRef = componentCollection.doc();
        const newComponent: Component = {
            ...data,
            id: newCompRef.id,
            groupId,
            isDefault: false,
            isDeleted: false
        };

        const structureRef = salaryCollection.doc(groupId);
        await newCompRef.set(newComponent);
        await structureRef.update({
            salaryComponent: admin.firestore.FieldValue.arrayUnion(newComponent.id),
        });

        logger.info(`Component added successfully`, { id: newCompRef.id, groupId });
        return newComponent;
    } catch (error) {
        logger.error(`Failed to add component`, { error });
        throw error;
    }
};

export const addDefaultComponent = async (baseComponent: Component) => {
    try {
        logger.info(`Adding default component`, { baseComponent });

        const newCompRef = componentCollection.doc();
        const newComponent: Component = {
            ...baseComponent,
            id: newCompRef.id,
            isDefault: true,
            isDeleted: false
        };

        await newCompRef.set(newComponent);
        logger.info(`Default component added successfully`, { id: newCompRef.id });

        return newComponent;
    } catch (error) {
        logger.error(`Failed to add default component`, { error });
        throw error;
    }
};

export const getAllStructure = async () => {
    try {
        logger.info(`Fetching all salary structures`);
        const snapshot = await salaryCollection.where("isDeleted", "==", false).get();

        const structures = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        logger.info(`Fetched salary structures`, { count: structures.length });
        return structures;
    } catch (error) {
        logger.error(`Failed to fetch salary structures`, { error });
        throw error;
    }
};

export const getComponent = async (groupId: string) => {
    try {
        logger.info(`Fetching components for group ${groupId}`);

        const structureSnap = await salaryCollection
            .where("id", "==", groupId)
            .where("isDeleted", "==", false)
            .limit(1)
            .get();

        if (structureSnap.empty) {
            logger.warn(`No salary structure found for groupId ${groupId}`);
            return {};
        }

        const structureRef = structureSnap.docs[0].ref;
        const structureData = structureSnap.docs[0].data();
        let salaryComponent: string[] = structureData.salaryComponent || [];

        if (!salaryComponent.length) {
            logger.warn(`No components found in salary structure`, { groupId });
            return {};
        }

        const componentSnap = await componentCollection
            .where("id", "in", salaryComponent)
            .where("isDeleted", "==", false)
            .get();

        if (componentSnap.empty) {
            logger.warn(`No active components found for structure`, { groupId });
            return {};
        }

        let components: Component[] = [];
        for (const doc of componentSnap.docs) {
            const comp = { id: doc.id, ...(doc.data() as Omit<Component, "id">) };

            if (comp.isDefault) {
                logger.info(`Cloning default component for group`, { groupId, compId: comp.id });

                const newCompRef = componentCollection.doc();
                const newComp: Component = {
                    ...comp,
                    id: newCompRef.id,
                    isDefault: false,
                    isDeleted: false,
                    groupId: groupId
                };

                await newCompRef.set(newComp);
                salaryComponent = salaryComponent.map((cid) => cid === comp.id ? newCompRef.id : cid);
                components.push(newComp);
            } else {
                components.push(comp);
            }
        }

        await structureRef.update({ salaryComponent });

        const groupedByType: Record<string, { count: number; components: Component[] }> = {};
        components.forEach((comp) => {
            const type = comp.type;
            if (!groupedByType[type]) {
                groupedByType[type] = { count: 0, components: [] };
            }
            groupedByType[type].components.push(comp);
            groupedByType[type].count++;
        });

        logger.info(`Fetched components grouped by type`, { groupId, groups: Object.keys(groupedByType) });
        return groupedByType;
    } catch (error) {
        logger.error(`Failed to fetch components for group ${groupId}`, { error });
        throw error;
    }
};

export const editStructure = async (id: string, update: Partial<SalaryStructure>) => {
    try {
        logger.info(`Editing salary structure`, { id, update });

        const structureRef = salaryCollection.doc(id);
        const snap = await structureRef.get();

        if (!snap.exists) {
            logger.error(`Salary structure not found`, { id });
            throw new Error("Salary Structure not found");
        }

        await structureRef.update(update);
        const updatedSnap = await structureRef.get();

        logger.info(`Salary structure updated successfully`, { id });
        return { id: updatedSnap.id, ...updatedSnap.data() } as SalaryStructure;
    } catch (error) {
        logger.error(`Failed to edit salary structure`, { id, error });
        throw error;
    }
};

export const editComponent = async (id: string, update: Partial<Component>) => {
    try {
        logger.info(`Editing component`, { id, update });

        const compRef = componentCollection.doc(id);
        const compSnap = await compRef.get();

        if (!compSnap.exists) {
            logger.error(`Component not found`, { id });
            throw new Error("Component not found");
        }

        const { id: _, groupId, isDefault, isDeleted, showOnPayslip, otherSetting, ...allowedUpdates } = update;
        await compRef.update(allowedUpdates);

        const updatedSnap = await compRef.get();
        logger.info(`Component updated successfully`, { id });

        return { id: updatedSnap.id, ...updatedSnap.data() } as Component;
    } catch (error) {
        logger.error(`Failed to edit component`, { id, error });
        throw error;
    }
};

export const deleteComponent = async (id: string) => {
    try {
        logger.info(`Deleting component with ID: ${id}`);

        const componentRef = componentCollection.doc(id);
        const componentSnap = await componentRef.get();

        if (!componentSnap.exists) {
            logger.error(`Component with ID ${id} not found`);
            throw new Error(`Component with ID ${id} does not exist`);
        }

        const componentData = componentSnap.data();

        if (componentData?.isDeleted) {
            logger.warn(`Component with ID ${id} is already deleted`);
            throw new Error(`Component with ID ${id} is already deleted`);
        }

        await componentRef.update({ isDeleted: true });

        const structuresSnap = await db
            .collection("salaryStructures")
            .where("salaryComponent", "array-contains", id)
            .get();

        const batch = db.batch();

        structuresSnap.forEach((doc) => {
            const structureRef = doc.ref;
            batch.update(structureRef, {
                salaryComponent: admin.firestore.FieldValue.arrayRemove(id),
            });
        });

        await batch.commit();
        logger.info(`Component deleted successfully`, { componentId: id });

        return {
            message: 'Component deleted successfully',
            componentId: id,
        };
    } catch (error: any) {
        logger.error(`Error deleting component with ID ${id}: ${error.message}`);
        throw new Error(error.message || 'Failed to delete component');
    }
};

export const deleteStructure = async (id: string) => {
    try {
        logger.info(`Deleting salary structure with ID: ${id}`);

        const structureRef = salaryCollection.doc(id);
        const snap = await structureRef.get();

        if (!snap.exists) {
            logger.error(`Salary structure not found with ID: ${id}`);
            throw new Error(`Salary structure with ID ${id} does not exist`);
        }

        const structure = snap.data() as SalaryStructure;
        logger.info(`Fetched salary structure: ${JSON.stringify(structure)}`);

        const batch = db.batch();

        if (structure.salaryComponent && structure.salaryComponent.length > 0) {
            logger.info(
                `Processing ${structure.salaryComponent.length} components for structure ${id}`
            );

            for (const compId of structure.salaryComponent) {
                const compRef = componentCollection.doc(compId);
                const compSnap = await compRef.get();

                if (compSnap.exists) {
                    const compData = compSnap.data();
                    logger.info(`Checking component ${compId}: ${JSON.stringify(compData)}`);

                    if (!compData?.isDefault) {
                        batch.update(compRef, { isDeleted: true });
                        logger.info(`Component ${compId} marked as deleted`);
                    } else {
                        logger.info(`Component ${compId} is default. Skipping delete`);
                    }
                } else {
                    logger.warn(`Component ${compId} not found in DB`);
                }
            }
        }

        batch.update(structureRef, { isDeleted: true });
        logger.info(`Marked salary structure ${id} as deleted`);

        await batch.commit();
        logger.info(`Batch commit successful for salary structure ${id}`);

        return { success: true, message: "Salary structure deleted successfully" };
    } catch (error: any) {
        logger.error(`Error deleting salary structure with ID ${id}`, { error });
        throw new Error(error.message || "Failed to delete salary structure");
    }
};