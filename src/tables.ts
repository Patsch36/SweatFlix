import { useDatabaseStore } from "./stores/databaseStore";

export const createTables = async () => {
  const databaseStore = useDatabaseStore();
  let tableCreations = 0;
  try {
    let promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS MuscleGroup (
		    ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Muscle TEXT,
		    SubMuscle TEXT,
        description TEXT,
        focused INTEGER
    );`);

    tableCreations += promise?.changes?.changes || 0;

    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS Plan (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        type TEXT,
        place TEXT,
        split TEXT,
        scheme TEXT
    );`);

    tableCreations += promise?.changes?.changes || 0;

    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS WorkoutTemplate (
        Name TEXT PRIMARY KEY,
        PlanID INTEGER,
        Split TEXT,
        Description TEXT,
        Color TEXT,
        active INTEGER,
        FOREIGN KEY (PlanID) REFERENCES Plan(ID)
    );`);

    tableCreations += promise?.changes?.changes || 0;

    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS weight (
      timestamp DEFAULT (datetime('now','localtime')) PRIMARY KEY,
      weight REAL NOT NULL
    );`);

    tableCreations += promise?.changes?.changes || 0;
  } catch (e) {
    alert("ERROR Creating DB " + JSON.stringify(e));
  }
  return tableCreations;
};

export const initTables = async () => {
  const databaseStore = useDatabaseStore();
  let tableInitialisations = 0;
  try {
    let promise = await databaseStore.getDatabase()
      ?.run(`INSERT INTO Plan (name, description, type, place, split, scheme)
      VALUES 
          ('PushPullLeg', 'A training plan that divides the body into three parts: Push, Pull and Leg', 'Strength training', 'Gym', '3-way split', 'tttr'),
          ('Upper/Lower Body', 'A training plan that divides the body into two parts: Upper body and Lower body', 'Strength training', 'Gym', '2-way split', 'ttrttr'),
          ('Full Body', 'A training plan where the entire body is trained in each training session', 'Strength training', 'Gym', 'Full body workout', 'trr'),
          ('Chest-Back-Legs-Arms', 'A training plan that divides the body into four parts: Chest, Back, Legs and Arms', 'Strength training', 'Gym', '4-way split', 'ttrttr'),
          ('FullBodyPush-FullBodyPull', 'A training plan where the entire body is trained in each training session, alternating between Push and Pull exercises', 'Strength training', 'Gym', 'Full body workout', 'ttr'),
          ('Push-Pull-Leg-Fullbody', 'A training plan that divides the body into four parts: Push, Pull, Leg and Full body workout', 'Strength training', 'Gym', '4-way split', 'tttrtr'),
          ('Push-Pull-Leg-UpperBody-LowerBody', 'A training plan that divides the body into five parts: Push, Pull, Leg, Upper body and Lower body', 'Strength training', 'Gym', '5-way split', 'tttrttr');`);

    tableInitialisations += promise?.changes?.changes || 0;

    promise = await databaseStore.getDatabase()
      ?.run(`INSERT INTO MuscleGroup (ID, Muscle, SubMuscle, description, focused)
      VALUES 
          (1, 'Chest', 'Upper Chest', 'The upper chest is the clavicular head of the pectoralis major muscle.', 0),
          (2, 'Chest', 'Middle Chest', 'The middle chest is the sternal head of the pectoralis major muscle.', 0),
          (3, 'Chest', 'Lower Chest', 'The lower chest is the abdominal head of the pectoralis major muscle.', 0),
          (4, 'Back', 'Upper Lat', 'The upper latissimus dorsi muscle is responsible for shoulder adduction and extension.', 0),
          (5, 'Back', 'Lower Lat', 'The lower latissimus dorsi muscle is responsible for shoulder adduction and extension.', 0),
          (6, 'Back', 'Trapezius', 'The trapezius muscle is responsible for moving, rotating, and stabilizing the scapula.', 0),
          (7, 'Back', 'Neck', 'The neck muscles are responsible for supporting and moving the head.', 0),
          (8, 'Biceps', 'Long Head', 'The long head of the biceps brachii muscle is responsible for elbow flexion and forearm supination.', 0),
          (9, 'Biceps', 'Short Head', 'The short head of the biceps brachii muscle is responsible for elbow flexion and forearm supination.', 0),
          (10, 'Biceps', 'Brachialis', 'The brachialis muscle is responsible for elbow flexion.', 0),
          (11, 'Triceps', 'Long Head', 'The long head of the triceps brachii muscle is responsible for elbow extension and shoulder adduction.', 0),
          (12, 'Triceps', 'Medial Head', 'The medial head of the triceps brachii muscle is responsible for elbow extension.', 0),
          (13, 'Triceps', 'Lateral Head', 'The lateral head of the triceps brachii muscle is responsible for elbow extension.', 0),
          (14, 'Legs', 'Extensors', 'The leg extensor muscles are responsible for extending the knee joint.', 0),
          (15, 'Legs', 'Flexors', 'The leg flexor muscles are responsible for flexing the knee joint.', 0),
          (16, 'Legs', 'Adductors', 'The leg adductor muscles are responsible for adducting the hip joint.', 0),
          (17, 'Legs', 'Calves', 'The calf muscles are responsible for plantar flexion of the foot.', 0),
          (18, 'Shoulders', 'Front Shoulder', 'The anterior deltoid muscle is responsible for shoulder flexion and internal rotation.', 0),
          (19, 'Shoulders', 'Rear Shoulder', 'The posterior deltoid muscle is responsible for shoulder extension and external rotation.', 0),
          (20, 'Shoulders', 'Lateral Shoulder', 'The lateral deltoid muscle is responsible for shoulder abduction.', 0),
          (21, 'Abs','Upper Abs','The upper rectus abdominis muscle is responsible for flexing the spine.',0),
          (22, 'Abs','Lower Abs','The lower rectus abdominis muscle is responsible for flexing the spine.',0),
          (23, 'Abs','Obliques','The internal and external oblique muscles are responsible for rotating and side-bending the trunk.',0);`);

    tableInitialisations += promise?.changes?.changes || 0;

    promise = await databaseStore.getDatabase()
      ?.run(`INSERT INTO WorkoutTemplate (Name, PlanID, Split, Description, Color, active)
      VALUES 
          ('Push-Request Workout', 3, 'Push', 'A push workout that will help you handle all your push requests.', 'navy', 0),
          ('Pull-Request Workout', 3, 'Pull', 'A pull workout that will help you handle all your pull requests.', 'lime', 0),
          ('Leg-Endary Code Workout', 3, 'Legs', 'A leg workout that will help you maintain your leg-endary code.', 'cerulean', 0),
          ('Full-Body Debugging Workout', 1, 'FullBody', 'A full-body workout that will help you debug your entire system.', 'coral', 0),
          ('Upper-Body Programming Workout', 2, 'Upperbody', 'An upper-body workout that will help you program your upper body to be stronger.', 'navy', 0),
          ('Lower-Body Programming Workout', 1, 'Lowerbody', 'A lower-body workout that will help you program your lower body to be stronger.', 'lime', 0),
          ('Full-Body Push Workout', 2, 'FullBodyPush', 'A full-body push workout that will help you push your limits.', 'cerulean', 0),
          ('Full-Body Pull Workout', 2, 'FullBodyPull', 'A full-body pull workout that will help you pull your weight.', 'coral', 0),
          ('Chest-Code Workout', 4, 'Chest', 'A chest workout that will help you debug your upper body.', 'navy', 1),
          ('Back-End Workout', 4, 'Back', 'A back workout that will strengthen your back-end.', 'lime', 1),
          ('Arm-Assembly Workout', 4, 'Arms', 'An arm workout that will help you assemble stronger arms.', 'cerulean', 1),
          ('Leg-acy Code Workout', 4, 'Legs', 'A leg workout that will help you maintain your leg-acy code.', 'coral', 1);`);

    tableInitialisations += promise?.changes?.changes || 0;
  } catch (e) {
    alert("ERROR initializing DB " + JSON.stringify(e));
  }
  return tableInitialisations;
};

export const dropTables = async () => {
  const databaseStore = useDatabaseStore();
  let tableDeletions = 0;
  try {
    let promise = await databaseStore
      .getDatabase()
      ?.run(`Drop Table WorkoutTemplate;`);
    tableDeletions += promise?.changes?.changes || 0;
    promise = await databaseStore.getDatabase()?.run(`Drop Table MuscleGroup;`);
    tableDeletions += promise?.changes?.changes || 0;
    promise = await databaseStore?.getDatabase()?.run(`Drop Table Plan;`);
    tableDeletions += promise?.changes?.changes || 0;
    // promise = await databaseStore.getDatabase()?.run(`Drop Table Weight;`);
    // tableDeletions += promise?.changes?.changes || 0;
  } catch (e) {
    alert("ERROR deleting Tables " + JSON.stringify(e));
  }
  return tableDeletions;
};
