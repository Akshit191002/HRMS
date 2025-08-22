// import * as admin from 'firebase-admin';
// import { Project } from '../models/project';
// import { Resources } from '../models/resouces';
// import logger from '../../utils/logger';

// const db = admin.firestore();

// const projectCollection = db.collection('projects');

// export const createProject = async (data: Project) => {
//   logger.info('Creating new project');
//   const docRef = projectCollection.doc();
//   const project = { id: docRef.id, ...data, isDeleted: false, teamMember: 0 };

//   await docRef.set(project);
//   logger.info('Project created successfully', { projectId: docRef.id });

//   return {
//     message: 'Project created successfully',
//     project: project,
//   };
// };

// export const getProject = async (id: string) => {
//   logger.info(`Fetching project with ID: ${id}`);
//   const projectRef = db.collection('projects').doc(id);
//   const projectSnap = await projectRef.get();

//   if (!projectSnap.exists) {
//     logger.error(`Project not found with ID: ${id}`);
//     throw new Error('Project not found');
//   }

//   const projectData = projectSnap.data() as Project;

//   if (projectData.isDeleted) {
//     logger.warn(`Project with ID ${id} has been deleted`);
//     throw new Error('Project has been deleted');
//   }
//   logger.info(`Fetching resources for project: ${id}`);
//   const resourceEmpCodes: string[] = projectData.resources || [];

//   const resourcePromises = resourceEmpCodes.map(async (empCode) => {
//     const snap = await db
//       .collection('resources')
//       .where('isDeleted', '==', false)
//       .where('empCode', '==', empCode)
//       .limit(1)
//       .get();

//     if (!snap.empty) {
//       logger.info(`Resource found for empCode: ${empCode}`);
//       return { id: snap.docs[0].id, ...snap.docs[0].data() };
//     }
//     logger.warn(`No resource found for empCode: ${empCode}`);
//     return null;
//   });

//   const resourceDetails = (await Promise.all(resourcePromises)).filter(Boolean);
//   logger.info(`Returning project details for ${id}`);
//   return {
//     id: projectSnap.id,
//     ...projectData,
//     resources: resourceDetails
//   };
// };

// export const allocateEmployeeToProject = async (projectId: string, allocation: Resources) => {
//   logger.info(`Allocating employee to project`);

//   const allocationRef = db.collection('resources').doc();
//   const projectRef = db.collection('projects').doc(projectId);

//   const generalSnap = await db
//     .collection('general')
//     .where('empCode', '==', allocation.empCode)
//     .limit(1)
//     .get();

//   if (generalSnap.empty) {
//     logger.error(`No Employee Found with empCode: ${allocation.empCode}`);
//     throw new Error(`No Employee Found with this ${allocation.empCode}`);
//   }

//   const generalDoc = generalSnap.docs[0];
//   const generalData = generalDoc.data();
//   const generalId = generalDoc.id;

//   const employeeSnap = await db
//     .collection('employees')
//     .where('generalId', '==', generalId)
//     .limit(1)
//     .get();

//   const employeeDoc = employeeSnap.docs[0]
//   const employeeId = employeeDoc.id;

//   const employeeData = employeeDoc.data();
//   const professionalSnap = await db.collection('professional').doc(employeeData.professionalId)
//   const pro = await professionalSnap.get();
//   const professionalData = pro.data()
//   if (!professionalData) {
//     logger.error(`Professional data not found for employee: ${employeeId}`);
//     throw new Error('Professional data not found');
//   }
//   console.log(professionalData)
//   const nameMatches = generalData.name.first.trim().toLowerCase() === allocation.name.trim().toLowerCase();
//   const departmentMatches = professionalData.department?.trim().toLowerCase() === allocation.department.trim().toLowerCase();
//   const designationMatches = professionalData.designation?.trim().toLowerCase() === allocation.designation.trim().toLowerCase();

//   if (!nameMatches) {
//     logger.error(`Name mismatch`, { expected: generalData.name, got: allocation.name });
//     throw new Error(`Name mismatch: expected "${generalData.name}", got "${allocation.name}"`);
//   }

//   if (!departmentMatches) {
//     logger.error(`Department mismatch`, { expected: professionalData.department, got: allocation.department });
//     throw new Error(`Department mismatch: expected "${professionalData.department}", got "${allocation.department}"`);
//   }

//   if (!designationMatches) {
//     logger.error(`Designation mismatch`, { expected: professionalData.designation, got: allocation.designation });
//     throw new Error(`Designation mismatch: expected "${professionalData.designation}", got "${allocation.designation}"`);
//   }

//   const employeeRef = db.collection('employees').doc(employeeId);
//   const projectSnap = await projectRef.get();

//   if (!projectSnap.exists) {
//     logger.error(`Project not found with ID: ${projectId}`);
//     throw new Error(`Project with ID ${projectId} does not exist`);
//   }

//   const projectData = projectSnap.data();
//   const currentTeamCount = projectData?.teamMember || 0;

//   const batch = db.batch();
//   batch.set(allocationRef, {
//     id: allocationRef.id,
//     ...allocation
//   });

//   batch.update(projectRef, {
//     resources: admin.firestore.FieldValue.arrayUnion(allocation.empCode),
//     teamMember: currentTeamCount + 1,
//   });

//   batch.update(employeeRef, {
//     projectId: admin.firestore.FieldValue.arrayUnion(allocationRef.id)
//   });

//   await batch.commit();
//   logger.info(`Employee allocated successfully`, { allocationId: allocationRef.id });
//   return {
//     message: 'Employee allocated successfully',
//     allocationId: allocationRef.id
//   };
// };

// export const editProject = async (id: string, data: Partial<Project>) => {
//   logger.info(`Editing project with ID: ${id}`);

//   const projectRef = db.collection('projects').doc(id);
//   const projectSnap = await projectRef.get();

//   if (!projectSnap.exists) {
//     logger.error(`Project with ID ${id} not found`);
//     throw new Error(`Project with id ${id} does not exist`);
//   }

//   await projectRef.update(data);

//   logger.info(`Project updated successfully`, { projectId: id });
//   return {
//     message: 'Project updated successfully',
//     projectId: id
//   };
// };

// export const deleteProject = async (id: string) => {
//   logger.info(`Deleting project with ID: ${id}`);

//   const projectRef = db.collection('projects').doc(id);
//   const projectSnap = await projectRef.get();

//   if (!projectSnap.exists) {
//     logger.error(`Project with ID ${id} not found`);
//     throw new Error(`Project with id ${id} does not exist`);
//   }

//   const projectData = projectSnap.data();
//   const resourceEmpCodes: string[] = projectData?.resources || [];

//   const batch = db.batch();
//   batch.update(projectRef, { isDeleted: true });

//   for (const empCode of resourceEmpCodes) {
//     const resSnap = await db
//       .collection('resources')
//       .where('empCode', '==', empCode)
//       .limit(1)
//       .get();

//     if (!resSnap.empty) {
//       const resDoc = resSnap.docs[0];
//       batch.update(resDoc.ref, { isDeleted: true });
//       logger.info(`Marked resource as deleted for empCode: ${empCode}`);
//     }
//   }

//   await batch.commit();
//   logger.info(`Project and resources deleted successfully`, { projectId: id });

//   return {
//     message: 'Project and associated resources deleted successfully',
//     projectId: id
//   };
// };

// export const getAllProjects = async () => {
//   logger.info(`Fetching all projects`);

//   const snapshot = await db.collection("projects").where("isDeleted", "!=", true).get();
//   const projects = snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
//   }));

//   logger.info(`Total projects fetched: ${projects.length}`);
//   return projects;
// };

// export const editResources = async (id: string, updatedData: Partial<Resources>) => {
//   logger.info(`Editing resource with ID: ${id}`);

//   const resourceRef = db.collection('resources').doc(id);
//   const resourceSnap = await resourceRef.get();

//   if (!resourceSnap.exists) {
//     logger.error(`Resource with ID ${id} not found`);
//     throw new Error(`Resource with ID ${id} not found`);
//   }

//   await resourceRef.update(updatedData);
//   logger.info(`Resource updated successfully`, { resourceId: id });

//   return {
//     message: 'Resource allocation updated successfully',
//     resourceId: id,
//     updatedFields: updatedData,
//   };
// };

import * as admin from 'firebase-admin';
import { Project } from '../models/project';
import { Resources } from '../models/resouces';
import logger from '../../utils/logger';

const db = admin.firestore();
const projectCollection = db.collection('projects');

export const createProject = async (data: Project) => {
  try {
    logger.info('Creating new project');
    const docRef = projectCollection.doc();
    const project = { id: docRef.id, ...data, isDeleted: false, teamMember: 0 };

    await docRef.set(project);
    logger.info('Project created successfully', { projectId: docRef.id });

    return {
      message: 'Project created successfully',
      project: project,
    };
  } catch (error) {
    logger.error('Error creating project', { error });
    throw error;
  }
};

export const getProject = async (id: string) => {
  try {
    logger.info(`Fetching project with ID: ${id}`);
    const projectRef = db.collection('projects').doc(id);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new Error('Project not found');
    }

    const projectData = projectSnap.data() as Project;

    if (projectData.isDeleted) {
      throw new Error('Project has been deleted');
    }

    logger.info(`Fetching resources for project: ${id}`);
    const resourceEmpCodes: string[] = projectData.resources || [];

    const resourcePromises = resourceEmpCodes.map(async (empCode) => {
      const snap = await db
        .collection('resources')
        .where('isDeleted', '==', false)
        .where('empCode', '==', empCode)
        .limit(1)
        .get();

      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
      return null;
    });

    const resourceDetails = (await Promise.all(resourcePromises)).filter(Boolean);
    return {
      id: projectSnap.id,
      ...projectData,
      resources: resourceDetails,
    };
  } catch (error) {
    logger.error(`Error fetching project with ID ${id}`, { error });
    throw error;
  }
};

export const allocateEmployeeToProject = async (projectId: string, allocation: Resources) => {
  try {
    logger.info(`Allocating employee to project`);

    const allocationRef = db.collection('resources').doc();
    const projectRef = db.collection('projects').doc(projectId);

    const generalSnap = await db
      .collection('general')
      .where('empCode', '==', allocation.empCode)
      .limit(1)
      .get();

    if (generalSnap.empty) {
      throw new Error(`No Employee Found with empCode: ${allocation.empCode}`);
    }

    const generalDoc = generalSnap.docs[0];
    const generalData = generalDoc.data();
    const generalId = generalDoc.id;

    const employeeSnap = await db
      .collection('employees')
      .where('generalId', '==', generalId)
      .limit(1)
      .get();

    const employeeDoc = employeeSnap.docs[0];
    const employeeId = employeeDoc.id;

    const employeeData = employeeDoc.data();
    const professionalSnap = db.collection('professional').doc(employeeData.professionalId);
    const pro = await professionalSnap.get();
    const professionalData = pro.data();

    if (!professionalData) {
      throw new Error('Professional data not found');
    }

    const nameMatches =
      generalData.name.first.trim().toLowerCase() === allocation.name.trim().toLowerCase();
    const departmentMatches =
      professionalData.department?.trim().toLowerCase() === allocation.department.trim().toLowerCase();
    const designationMatches =
      professionalData.designation?.trim().toLowerCase() === allocation.designation.trim().toLowerCase();

    if (!nameMatches) {
      throw new Error(`Name mismatch: expected "${generalData.name.first}", got "${allocation.name}"`);
    }

    if (!departmentMatches) {
      throw new Error(
        `Department mismatch: expected "${professionalData.department}", got "${allocation.department}"`
      );
    }

    if (!designationMatches) {
      throw new Error(
        `Designation mismatch: expected "${professionalData.designation}", got "${allocation.designation}"`
      );
    }

    const employeeRef = db.collection('employees').doc(employeeId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new Error(`Project with ID ${projectId} does not exist`);
    }

    const projectData = projectSnap.data();
    const currentTeamCount = projectData?.teamMember || 0;

    const batch = db.batch();
    batch.set(allocationRef, {
      id: allocationRef.id,
      ...allocation,
    });

    batch.update(projectRef, {
      resources: admin.firestore.FieldValue.arrayUnion(allocation.empCode),
      teamMember: currentTeamCount + 1,
    });

    batch.update(employeeRef, {
      projectId: admin.firestore.FieldValue.arrayUnion(allocationRef.id),
    });

    await batch.commit();
    return {
      message: 'Employee allocated successfully',
      allocationId: allocationRef.id,
    };
  } catch (error) {
    logger.error(`Error allocating employee to project ${projectId}`, { error });
    throw error;
  }
};

export const editProject = async (id: string, data: Partial<Project>) => {
  try {
    logger.info(`Editing project with ID: ${id}`);
    const projectRef = db.collection('projects').doc(id);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new Error(`Project with id ${id} does not exist`);
    }

    await projectRef.update(data);

    return {
      message: 'Project updated successfully',
      projectId: id,
    };
  } catch (error) {
    logger.error(`Error editing project with ID ${id}`, { error });
    throw error;
  }
};

export const deleteProject = async (id: string) => {
  try {
    logger.info(`Deleting project with ID: ${id}`);
    const projectRef = db.collection('projects').doc(id);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new Error(`Project with id ${id} does not exist`);
    }

    const projectData = projectSnap.data();
    const resourceEmpCodes: string[] = projectData?.resources || [];

    const batch = db.batch();
    batch.update(projectRef, { isDeleted: true });

    for (const empCode of resourceEmpCodes) {
      const resSnap = await db
        .collection('resources')
        .where('empCode', '==', empCode)
        .limit(1)
        .get();

      if (!resSnap.empty) {
        const resDoc = resSnap.docs[0];
        batch.update(resDoc.ref, { isDeleted: true });
      }
    }

    await batch.commit();
    return {
      message: 'Project and associated resources deleted successfully',
      projectId: id,
    };
  } catch (error) {
    logger.error(`Error deleting project with ID ${id}`, { error });
    throw error;
  }
};

export const getAllProjects = async () => {
  try {
    logger.info(`Fetching all projects`);
    const snapshot = await db.collection('projects').where('isDeleted', '!=', true).get();
    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return projects;
  } catch (error) {
    logger.error(`Error fetching all projects`, { error });
    throw error;
  }
};

export const editResources = async (id: string, updatedData: Partial<Resources>) => {
  try {
    logger.info(`Editing resource with ID: ${id}`);
    const resourceRef = db.collection('resources').doc(id);
    const resourceSnap = await resourceRef.get();

    if (!resourceSnap.exists) {
      throw new Error(`Resource with ID ${id} not found`);
    }

    await resourceRef.update(updatedData);

    return {
      message: 'Resource allocation updated successfully',
      resourceId: id,
      updatedFields: updatedData,
    };
  } catch (error) {
    logger.error(`Error editing resource with ID ${id}`, { error });
    throw error;
  }
};
