/**
 * Migration: Remove Organizations
 * 
 * Removes organization-related fields and collections from the database.
 * WARNING: This is a destructive migration. Backup your database before running.
 */

const dropIndexIfExists = async (collection, indexName) => {
  try {
    await collection.dropIndex(indexName);
  } catch (error) {
    // Index doesn't exist or already dropped - ignore
  }
};

const createIndexIfNotExists = async (collection, indexSpec, options = {}) => {
  try {
    await collection.createIndex(indexSpec, options);
  } catch (error) {
    // Index already exists - ignore
  }
};

module.exports = {
  async up(db) {
    // Remove organization field from users
    await db.collection('users').updateMany(
      {},
      { $unset: { organization: "" } }
    );

    // Remove organization field from projects
    await db.collection('projects').updateMany(
      {},
      { $unset: { organization: "" } }
    );

    // Drop old compound indexes
    const projectsCollection = db.collection('projects');
    await dropIndexIfExists(projectsCollection, 'name_1_organization_1');
    await dropIndexIfExists(projectsCollection, 'organization_1_active_1');

    // Create new indexes
    await createIndexIfNotExists(projectsCollection, { name: 1 }, { unique: true });
    await createIndexIfNotExists(projectsCollection, { active: 1 });

    // Drop organizations collection
    try {
      await db.collection('organizations').drop();
    } catch (error) {
      // Collection doesn't exist - ignore
    }
  },

  async down(db) {
    // Note: Cannot restore deleted organization data
    // Only restore indexes structure
    
    const projectsCollection = db.collection('projects');
    
    try {
      await dropIndexIfExists(projectsCollection, 'name_1');
      await createIndexIfNotExists(
        projectsCollection,
        { name: 1, organization: 1 },
        { unique: true }
      );
      await createIndexIfNotExists(
        projectsCollection,
        { organization: 1, active: 1 }
      );
    } catch (error) {
      // Ignore errors during rollback
    }
  }
};

