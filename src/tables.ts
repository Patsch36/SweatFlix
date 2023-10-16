import { useDatabaseStore } from "./stores/databaseStore";

export const createTables = async () => {
  const databaseStore = useDatabaseStore();
  let tableCreations = 0;
  try {
    try {
      await databaseStore.getDatabase()?.query("SELECT * FROM MuscleGroup;");
    } catch {
      tableCreations += 1;
    }
    let promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS MuscleGroup (
		    ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Muscle TEXT,
		    SubMuscle TEXT,
        description TEXT,
        focused INTEGER
    );`);

    try {
      await databaseStore.getDatabase()?.query("SELECT * FROM Plan;");
    } catch {
      tableCreations += 1;
    }
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

    try {
      await databaseStore
        .getDatabase()
        ?.query("SELECT * FROM WorkoutTemplate;");
    } catch {
      tableCreations += 1;
    }

    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS WorkoutTemplate (
        Name TEXT PRIMARY KEY,
        Split TEXT,
        Description TEXT,
        Color TEXT,
        active INTEGER,
        archivated INTEGER DEFAULT 0
    );`);

    try {
      await databaseStore
        .getDatabase()
        ?.query("SELECT * FROM WorkoutTemplatePlan;");
    } catch {
      tableCreations += 1;
    }

    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS WorkoutTemplatePlan (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            WorkoutTemplateName TEXT,
            PlanID INTEGER,
            OrderIndex INTEGER,
            FOREIGN KEY (WorkoutTemplateName) REFERENCES WorkoutTemplate(Name),
            FOREIGN KEY (PlanID) REFERENCES Plan(ID)
  );`);

    try {
      await databaseStore.getDatabase()?.query("SELECT * FROM weight;");
    } catch {
      tableCreations += 1;
    }
    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS weight (
      timestamp DEFAULT (datetime('now','localtime')) PRIMARY KEY,
      weight REAL NOT NULL
    );`);

    try {
      await databaseStore.getDatabase()?.query("SELECT * FROM Workout;");
    } catch {
      tableCreations += 1;
    }
    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS Workout (
        startdate DATETIME PRIMARY KEY,
        enddate DATETIME,
        note TEXT,
        workoutname TEXT,
        FOREIGN KEY (workoutname) REFERENCES WorkoutTemplate(Name)
    );`);

    try {
      await databaseStore.getDatabase()?.query("SELECT * FROM Exercise;");
    } catch {
      tableCreations += 1;
    }
    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS Exercise(
        name TEXT PRIMARY KEY,
        description TEXT,
        image TEXT,
        muscleGroup INTEGER,
        SecondaryMuscleGroup TEXT,
        Bodyweight INTEGER,
        Isolation INTEGER,
        FOREIGN KEY (muscleGroup) REFERENCES MuscleGroup(ID)
    );`);

    try {
      await databaseStore
        .getDatabase()
        ?.query("SELECT * FROM WorkoutExercise;");
    } catch {
      tableCreations += 1;
    }
    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS WorkoutExercise (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise TEXT,
        workout DATETIME,
        setNumber INTEGER,
        reps INTEGER,
        weight INTEGER,
        unit TEXT,
        FOREIGN KEY (exercise) REFERENCES Exercise(name)
        FOREIGN KEY (workout) REFERENCES Workout(startdate)
    );`);

    try {
      await databaseStore.getDatabase()?.query("SELECT * FROM WorkoutList;");
    } catch {
      tableCreations += 1;
    }
    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS WorkoutList (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutPlan TEXT,
        exerciseName TEXT,
        sets INTEGER,
        reps TEXT,
        OrderIndex INTEGER,
        UNIQUE (workoutPlan, exerciseName),
        FOREIGN KEY (workoutPlan) REFERENCES WorkoutTemplate(Name),
        FOREIGN KEY (exerciseName) REFERENCES Exercise(Name)
      );`);

    try {
      await databaseStore.getDatabase()?.query(`SELECT * FROM Achievements;
      `);
    } catch {
      tableCreations += 1;
    }
    promise = await databaseStore.getDatabase()
      ?.run(`CREATE TABLE IF NOT EXISTS Achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        imageURL TEXT,
        achieved INTEGER DEFAULT 0,
        obtained DATETIME
      );`);
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
      ?.run(`INSERT INTO WorkoutTemplate (Name, Split, Description, Color, active)
      VALUES 
          ('Push-Request Workout', 'Push', 'A push workout that will help you handle all your push requests.', 'magenta', 0),
          ('Pull-Request Workout', 'Pull', 'A pull workout that will help you handle all your pull requests.', 'lime', 0),
          ('Leg-Endary Code Workout', 'Legs', 'A leg workout that will help you maintain your leg-endary code.', 'cerulean', 0),
          ('Full-Body Debugging Workout', 'FullBody', 'A full-body workout that will help you debug your entire system.', 'coral', 0),
          ('Upper-Body Programming Workout', 'Upperbody', 'An upper-body workout that will help you program your upper body to be stronger.', 'magenta', 0),
          ('Lower-Body Programming Workout', 'Lowerbody', 'A lower-body workout that will help you program your lower body to be stronger.', 'lime', 0),
          ('Full-Body Push Workout', 'FullBodyPush', 'A full-body push workout that will help you push your limits.', 'cerulean', 0),
          ('Full-Body Pull Workout', 'FullBodyPull', 'A full-body pull workout that will help you pull your weight.', 'coral', 0),
          ('Chest-Code Workout', 'Chest', 'A chest workout that will help you debug your upper body.', 'magenta', 1),
          ('Back-End Workout', 'Back', 'A back workout that will strengthen your back-end.', 'lime', 1),
          ('Arm-Assembly Workout', 'Arms', 'An arm workout that will help you assemble stronger arms.', 'cerulean', 1),
          ('Leg-acy Code Workout', 'Legs', 'A leg workout that will help you maintain your leg-acy code.', 'coral', 1);`);

    tableInitialisations += promise?.changes?.changes || 0;

    promise = await databaseStore.getDatabase()
      ?.run(`INSERT INTO WorkoutTemplatePlan (WorkoutTemplateName, PlanID, OrderIndex)
  VALUES 
    ('Push-Request Workout', 1, 0),
    ('Pull-Request Workout', 1, 1),
    ('Leg-Endary Code Workout', 1, 2),
    ('Upper-Body Programming Workout', 2, 0),
    ('Lower-Body Programming Workout', 2, 1),
    ('Full-Body Debugging Workout', 3, 0),
    ('Chest-Code Workout', 4, 0),
    ('Back-End Workout', 4, 1),
    ('Leg-Endary Code Workout', 4, 2),
    ('Arm-Assembly Workout', 4, 3),
    ('Full-Body Push Workout', 5, 0),
    ('Full-Body Pull Workout', 5, 1),
    ('Push-Request Workout', 6, 0),
    ('Pull-Request Workout', 6, 1),
    ('Leg-Endary Code Workout', 6, 2),
    ('Full-Body Debugging Workout', 6, 3),
    ('Push-Request Workout', 7, 0),
    ('Pull-Request Workout', 7, 1),
    ('Leg-Endary Code Workout', 7, 2),
    ('Upper-Body Programming Workout', 7, 3),
    ('Lower-Body Programming Workout', 7, 4);`);

    promise = await databaseStore.getDatabase()
      ?.run(`INSERT INTO Workout (startdate, enddate, note, workoutname)
      VALUES 
          ('2023-09-02T06:30:00', '2023-09-02T08:00:00', '', 'Chest-Code Workout'),
          ('2023-08-31T06:30:00', '2023-08-31T08:00:00', '', 'Leg-acy Code Workout'),
          ('2023-08-30T06:30:00', '2023-08-30T08:00:00', '', 'Arm-Assembly Workout'),
          ('2023-08-28T06:30:00', '2023-08-28T08:00:00', '', 'Back-End Workout');`);

    tableInitialisations += promise?.changes?.changes || 0;

    promise = await databaseStore.getDatabase()
      ?.run(`INSERT INTO Exercise (MuscleGroup, Isolation, Bodyweight, SecondaryMuscleGroup Name, Description, Image)
      VALUES
        (1,  0, 0, '[2, 11, 12]', 'Incline Bench Press', 'This exercise primarily targets the upper chest muscles. To perform this exercise, lie back on an incline bench. Hold a barbell or dumbbells above your chest with your arms fully extended. Lower the weights to your chest, then push them back up to the starting position. This movement should be done in a controlled manner, focusing on the contraction and stretch of your upper chest muscles.', ''),
        (2,  0, 0, '[11, 12, 13]', 'Bench Press', 'This exercise targets the middle chest muscles. Lie flat on a bench with your feet firmly planted on the ground. Hold a barbell or dumbbells above your chest with arms fully extended. Lower the weights to your chest and then press them back up to the starting position, engaging your middle chest muscles throughout the movement.', ''),
        (3,  0, 0, '[12, 13]', 'Decline Bench Press', 'This exercise targets the lower chest muscles. Lie on a decline bench with your feet securely hooked under the leg brace. Lift a barbell or dumbbells from the rack and hold it straight over your chest with your arms fully extended. Lower the weights until they lightly touch your lower chest, then push them back up, focusing on using your lower chest muscles.', ''),
        (4,  0, 1, '[5, 6, 8, 9, 10]', 'Pull-Up', 'This exercise targets the upper latissimus dorsi muscles (upper back). Hang from a pull-up bar with your hands slightly wider than shoulder-width apart and palms facing away from you. Pull yourself up until your chin is above the bar, squeezing your shoulder blades together at the top of the movement. Lower yourself back down in a controlled manner.', ''),
        (5,  1, 0, '[6, 8]', 'Seated Row', 'This exercise targets the lower latissimus dorsi muscles (lower back). Sit at a rowing machine with your feet on the footrests and knees slightly bent. Grab the handle and pull it towards your torso while keeping your back straight and shoulders down. Extend your arms to return to the starting position, engaging your lower lats throughout.', ''),
        (7,  1, 0, '[6]', 'Shrug', 'This exercise targets the trapezius muscles (upper back and neck). Stand straight with a weight in each hand, arms fully extended, and palms facing your torso. Lift your shoulders up as high as possible while keeping your arms extended, then lower them back down after a short pause.', ''),
        (7,  1, 0, '[]', 'Neck Extension', 'This exercise targets the neck muscles. Sit or stand upright and tilt your head backward as far as comfortably possible, providing resistance with your hand or a resistance band for added intensity.', ''),
        (8,  1, 0, '[9, 10]', 'Incline Dumbbell Curl', 'This exercise targets the long head of the biceps brachii muscle (upper arm). Sit back on an incline bench with a dumbbell in each hand held at arm´s length, palms facing forward. Curl the weights while keeping your upper arms stationary, then lower them back down after a short pause.', ''),
        (9,  1, 0, '[8, 10]', 'Preacher Curl', 'This exercise targets the short head of the biceps brachii muscle (upper arm). Sit at a preacher bench and place your upper arms on the pad, holding a barbell or dumbbells with an underhand grip. Curl the weights up until your biceps are fully contracted, then lower them back down after a short pause.', ''),
        (10, 1, 0, '[8, 9]', 'Hammer Curl', 'This exercise targets the brachialis muscle (upper arm). Stand up straight with a dumbbell in each hand, arms fully extended, and palms facing your torso (neutral grip). Curl the weights while keeping your upper arms stationary, then lower them back down after a short pause.', ''),
        (11, 1, 0, '[12, 13]', 'Overhead Triceps Extension', 'This exercise targets the long head of the triceps brachii muscle (back of upper arm). Stand or sit with a dumbbell held by both hands overhead at arm´s length. Lower it behind your head by bending at the elbow, then extend your arm to return to starting position.', ''),
        (12, 1, 0, '[11, 13]', 'Triceps Pushdown', 'This exercise targets the medial head of the triceps brachii muscle (back of upper arm). Stand in front of a cable machine with a bar attachment set at upper chest level. Grab it with an overhand grip and push it down until your arms are fully extended, then return to starting position after a short pause.', ''),
        (13, 1, 0, '[11, 12]', 'Skull Crusher', 'This exercise targets lateral head of triceps brachii muscle (back of upper arm). Lie on a flat bench holding an EZ curl bar or dumbbells directly above you with arms fully extended. Bend at elbows to lower weights towards forehead (hence "skull crusher"), then extend arms to return to starting position.', ''),
        (14, 1, 0, '[]', 'Leg Extension', 'This exercise targets quadriceps muscles (front of thigh). Sit on a leg extension machine with feet under foot pad and hands holding side bars for support. Extend legs until they´re parallel to floor, then slowly return to starting position.', ''),
        (15, 1, 0, '[17]', 'Leg Curl', 'This exercise targets hamstring muscles (back of thigh). Lie face down on leg curl machine with ankles hooked under foot pad and hands holding side bars for support. Curl legs towards buttocks as far as comfortably possible, then slowly return to starting position.', ''),
        (16, 1, 0, '[]', 'Hip Adduction', 'This exercise targets adductor muscles (inner thigh). Sit on a hip adduction machine with legs spread wide and feet on foot pads. Bring legs together against resistance, then slowly return to starting position.', ''),
        (17, 1, 0, '[]', 'Calf Raise', 'This exercise targets calf muscles. Stand upright holding weights with feet hip-width apart. Rise up onto toes, hold for a moment, then lower back down.', ''),
        (18, 1, 0, '[]', 'Front Raise', 'This exercise targets anterior deltoid muscle (front of shoulder). Stand with feet shoulder-width apart holding weights in front of thighs. Raise weights in front of you until arms are parallel to floor, then lower back down.', ''),
        (19, 1, 0, '[6, 11]', 'Reverse Fly', 'This exercise targets posterior deltoid muscle (back of shoulder). Stand or sit and lean forward with weights in hands and elbows slightly bent. Lift weights out to sides until arms are parallel to floor, then lower back down.', ''),
        (20, 1, 0, '[]', 'Lateral Raise', 'This exercise targets lateral deltoid muscle (middle of shoulder). Stand with feet shoulder-width apart holding weights at sides. Lift weights out to sides until arms are parallel to floor, then lower back down.', ''),
        (21, 1, 1, '[22]', 'Crunch', 'This exercise targets upper rectus abdominis muscle (upper abs). Lie on back with knees bent and hands behind head. Lift upper body towards knees using abdominal muscles, then lower back down.', ''),
        (22, 1, 1, '[21]', 'Reverse Crunch', 'This exercise targets lower rectus abdominis muscle (lower abs). Lie on back with knees bent and hands at sides or under hips for support. Lift legs towards chest using abdominal muscles, then lower back down.', ''),
        (23, 1, 1, '[]', 'Russian Twist', 'This exercise targets the internal and external oblique muscles (sides of the abdomen). Sit on the floor with your knees bent, pull your abs to your spine, and lean back a few inches while keeping your back straight. Hold your hands in front of you and twist your torso to the right, then to the left to complete one rep, maintaining a strong core throughout. You can also hold a weight or a medicine ball in your hands for added resistance. This movement engages your obliques and helps improve core strength and stability.', ''),
        (1,  1, 0, '[11, 12]', 'Dumbbell Flyes', 'This exercise targets the upper chest muscles. Lie on an incline bench with a dumbbell in each hand. Extend your arms above you with a slight bend at the elbows. Lower your arms out to the sides in a wide arc until you feel a stretch in your chest. Return your arms back to the starting position.', ''),
        (2,  0, 1, '[3, 11, 12 ,13]', 'Chest Dips', 'This exercise targets the middle chest muscles. Hold onto the parallel bars of a dip station and lower your body until your upper arms are parallel to the floor. Push back up until your arms are fully extended.', ''),
        (3,  1, 0, '[12, 13]', 'Cable Crossover', 'This exercise targets the lower chest muscles. Stand in the middle of a cable machine with the cables set to high. Grab the handles and pull them down and across your body. Return to the start position in a controlled manner.', ''),
        (4,  1, 0, '[6, 8, 9, 10]', 'Lat Pulldown', 'This exercise targets the upper latissimus dorsi muscles. Sit at a lat pulldown station and grab the bar with an overhand grip that’s just beyond shoulder width. Pull the bar down to your chest, then return slowly to the start position.', ''),
        (5,  0, 0, '[4, 6, 14, 15, 21, 22]', 'Deadlift', 'This exercise targets the lower latissimus dorsi muscles. Stand with feet hip-width apart and bend at your hips and knees to grab a barbell with an overhand grip. Keeping your lower back naturally arched, pull your torso up and thrust your hips forward as you stand up with the barbell.', ''),
        (6,  1, 0, '[6]', 'Dumbbell Shrug', 'This exercise targets the trapezius muscles. Stand holding dumbbells at arm’s length by your sides. Shrug your shoulders as high as you can.', ''),
        (7,  1, 0, '[]', 'Neck Flexion', 'This exercise targets the neck muscles. Sit on a bench and place a weight plate on the back of your head. Slowly lower your head towards your chest, then lift it back up.', ''),
        (8,  1, 0, '[9, 10]', 'Barbell Curl', 'This exercise targets the long head of the biceps brachii muscle. Stand up straight with a barbell in your hands at shoulder-width apart. Keeping your elbows close to your torso, curl the weights while contracting your biceps.', ''),
        (9,  1, 0, '[8, 10]', 'Concentration Curl', 'This exercise targets the short head of the bicUeps brachii muscle. Sit on a flat bench with one dumbbell in front of you between your legs. Use your right arm to pick up the dumbbell and curl it towards your chest.', ''),
        (10, 1, 0, '[8, 9]', 'Reverse Curl', 'This exercise targets the brachialis muscle. Hold a barbell or EZ-bar with palms facing down and hands shoulder-width apart. Curl the bar towards your chest, keeping elbows close to body.', ''),
        (11, 0, 0, '[12, 13]', 'Close-Grip Bench Press', 'This exercise targets the long head of the triceps brachii muscle. Lie on a flat bench holding a barbell with hands shoulder-width apart. Lower it to your chest, then press it back up powerfully.', ''),
        (12, 1, 0, '[11, 12]', 'Triceps Kickback', 'This exercise targets the medial head of the triceps brachii muscle. Hold a dumbbell in one hand and lean forward slightly. Keep elbow at 90 degrees as you extend arm straight back.', ''),
        (13, 0, 1, '[11, 12]', 'Diamond Push-Up', 'This exercise targets the lateral head of the triceps brachii muscle. Get into push-up position with hands close together so thumbs and index fingers touch. Lower body until chest nearly touches floor and then push up.', ''),
        (14, 0, 0, '[15, 16, 21, 22]', 'Squat', 'This exercise targets the leg extensor muscles. Stand tall with feet hip-width apart holding a barbell across upper back with overhand grip. Lower body until thighs are parallel to floor then push back up.', ''),
        (15, 1, 0, '[17]', 'Hamstring Curl', 'This exercise targets the leg flexor muscles. Lie face down on a leg curl machine with ankles against lower pad and legs fully extended. Without lifting waist or thighs off of bench, curl legs towards buttocks until fully flexed.', ''),
        (16, 1, 0, '[]', 'Side Lunge', 'This exercise targets the leg adductor muscles. Stand tall holding two dumbbells at arm’s length by sides. Take big step to left and lower body by bending left hip and knee until thigh is parallel to floor.', ''),
        (17, 1, 0, '[]', 'Seated Calf Raise', 'This exercise targets the calf muscles. Sit on machine and place toes on lower portion of platform with heels extending off it. Place lower thighs under lever pad and lift lever by extending ankles.', ''),
        (18, 0, 0, '[11, 12 ,13, 20]', 'Shoulder Press', 'This exercise targets the anterior deltoid muscle. Sit on a bench and hold a barbell at shoulder height. Press the barbell straight up until your arms are fully extended.', ''),
        (19, 0, 0, '[4, 5, 6]', 'Bent-Over Reverse Fly', 'This exercise targets the posterior deltoid muscle. Hold a pair of dumbbells and bend forward at your hips until your torso is nearly parallel to the floor. Let the dumbbells hang straight down. Raise both arms out to the sides as you squeeze your shoulder blades together.', ''),
        (20, 1, 0, '[18]', 'Dumbbell Lateral Raise', 'This exercise targets the lateral deltoid muscle. Stand holding a pair of dumbbells at arm’s length by your sides with palms facing each other. Without moving your torso, lift the dumbbells out to your sides.', ''),
        (21, 1, 1, '[22]', 'Sit-Up','This exercise targets the upper rectus abdominis muscle. Lie down on your back and bend your legs with feet flat on the ground. Place your hands behind your head and lift your upper body towards your knees.',''),
        (22, 1, 1, '[21]', 'Leg Raise','This exercise targets the lower rectus abdominis muscle. Lie on your back with your hands at your sides or under your glutes. Keeping legs straight, lift them all the way up to the ceiling.',''),
        (23, 1, 1, '[]', 'Side Plank','This exercise targets the internal and external oblique muscles. Start on your side with feet together and one forearm directly below shoulder. Contract core and raise hips until body is straight from head to feet.','');`);

    tableInitialisations += promise?.changes?.changes || 0;

    // ('Chest-Code Workout', 'Bench Press', 3, '8-12'),
    // ('Chest-Code Workout', 'Decline Bench Press', 3, '8-12'),
    promise = await databaseStore.getDatabase()
      ?.run(`INSERT INTO WorkoutList (OrderIndex, workoutPlan, exerciseName, sets, reps)
        VALUES 
          (0, 'Chest-Code Workout', 'Incline Bench Press', 2, '8-12'),
          (0, 'Back-End Workout', 'Pull-Up', 3, '8-12'),
          (1, 'Back-End Workout', 'Seated Row', 3, '8-12'),
          (2, 'Back-End Workout', 'Shrug', 3, '8-12'),
          (0, 'Arm-Assembly Workout', 'Incline Dumbbell Curl', 3, '8-12'),
          (1, 'Arm-Assembly Workout', 'Preacher Curl', 3, '8-12'),
          (2, 'Arm-Assembly Workout', 'Hammer Curl', 3, '8-12'),
          (0, 'Leg-acy Code Workout', 'Leg Extension', 3, '8-12'),
          (1, 'Leg-acy Code Workout', 'Leg Curl', 3, '8-12'),
          (2, 'Leg-acy Code Workout', 'Hip Adduction', 3, '8-12'),
          (0, 'Push-Request Workout', 'Incline Bench Press', 3, '8-12'),
          (1, 'Push-Request Workout', 'Overhead Triceps Extension', 3, '8-12'),
          (2, 'Push-Request Workout', 'Front Raise', 3, '8-12'),
          (0, 'Pull-Request Workout', 'Pull-Up', 3, '8-12'),
          (1, 'Pull-Request Workout', 'Seated Row', 3, '8-12'),
          (2, 'Pull-Request Workout', 'Incline Dumbbell Curl', 3, '8-12'),
          (3, 'Pull-Request Workout', 'Hammer Curl', 3, '8-12'),
          (0, 'Leg-Endary Code Workout', 'Leg Extension', 3, '8-12'),
          (1, 'Leg-Endary Code Workout', 'Leg Curl', 3, '8-12'),
          (2, 'Leg-Endary Code Workout', 'Calf Raise', 3, '8-12'),
          (0, 'Full-Body Debugging Workout', 'Incline Bench Press', 3, '8-12'),
          (1, 'Full-Body Debugging Workout', 'Pull-Up', 3, '8-12'),
          (2, 'Full-Body Debugging Workout', 'Incline Dumbbell Curl', 3, '8-12'),
          (3, 'Full-Body Debugging Workout', 'Overhead Triceps Extension', 3, '8-12'),
          (4, 'Full-Body Debugging Workout', 'Leg Extension', 3, '8-12'),
          (0, 'Upper-Body Programming Workout', 'Incline Bench Press', 3, '8-12'),
          (1, 'Upper-Body Programming Workout', 'Pull-Up', 3, '8-12'),
          (2, 'Upper-Body Programming Workout', 'Incline Dumbbell Curl', 3, '8-12'),
          (3, 'Upper-Body Programming Workout', 'Overhead Triceps Extension', 3, '8-12'),
          (0, 'Lower-Body Programming Workout', 'Leg Extension', 3, '8-12'),
          (1, 'Lower-Body Programming Workout', 'Leg Curl', 3, '8-12'),
          (2, 'Lower-Body Programming Workout', 'Calf Raise', 3, '8-12'),
          (0, 'Full-Body Push Workout', 'Incline Bench Press', 3, '8-12'),
          (1, 'Full-Body Push Workout', 'Overhead Triceps Extension', 3, '8-12'),
          (2, 'Full-Body Push Workout', 'Front Raise', 3, '8-12'),
          (0, 'Full-Body Pull Workout', 'Pull-Up', 3, '8-12'),
          (1, 'Full-Body Pull Workout', 'Seated Row', 3, '8-12'),
          (2, 'Full-Body Pull Workout', 'Incline Dumbbell Curl', 3, '8-12'),
          (3, 'Full-Body Pull Workout', 'Hammer Curl', 3, '8-12');`);

    tableInitialisations += promise?.changes?.changes || 0;

    promise = await databaseStore.getDatabase()
      ?.run(`INSERT INTO Achievements (name, description, imageURL, achieved)
      VALUES
        ('Iron Beginner', 'Lift 50 kg weight in one exercise.', '50kg', 0),
        ('Strength Master', 'Lift 100 kg weight in one exercise.', '100kg', 0),
        ('Iron Pro', 'Lift 150 kg weight in one exercise.', '150kg', 0),
        ('Repetition Hero', 'Achieve 20 repetitions with 50 kg weight in one exercise.', '20Reps50kg', 0),
        ('Iron Athlete', 'Lift 1.5 times your body weight in one exercise.', '1_5You', 0),
        ('Heavy Weights', 'Lift 200 kg weight in one exercise.', '200kg', 0),
        ('Weight Record', 'Achieve a personal weightlifting record in one exercise after absolving it at least 30 times.', 'record', 0),
        ('Steel Muscles', 'Achieve 10 repetitions with 100 kg weight in one Upper Body exercise.', 'steelmuscles', 0),
        ('Strength Beast', 'Lift 250 kg weight in one exercise.', '250kg', 0),
        ('Iron Legend', 'Lift 300 kg weight in one exercise.', '300kg', 0),
        ('LEG-endary', 'Achieve 10 repetitions with 100 kg weight in Squats, 10 repetitions in 150 kg Hip Thrusts and 10 repetitions 300 kg in Leg Press. (Mind the naming of your exercises to be as in the description)', 'blondie', 0),
        ('Bit Crusher', 'Crush your personal records by adding 8 reps to your bench press max weight (Max Weight first counts after at least 30 workouts). It´s like compressing bits for a stronger you!', '8RepsBench', 0),
        ('Code Compiler', 'Compile your strength by increasing your squat weight to a power of 2 (e.g., 64 kg). Your muscles will execute flawless code!', 'codecompiler', 0),
        ('Algorithmic Abs', 'Achieve chiseled abs with a set of 10 different core exercises. Your stomach will be processing algorithms, not just food!', 'algoabs', 0),
        ('JavaScript Jumper', 'Jump higher in your progress, reaching heights greater than the average JavaScript framework update while increasing your Rep-Weight over 20kg as your workout before!', 'jsjumper', 0),
        ('Database Deadlifter', 'Lift your weight as easy as a database query and reach 150kg deadlifts!', 'dbdeadlift', 0),
        ('Pixel Pusher', 'Push your limits by bench pressing at least 1920kg in one set.', 'pixelpusher', 0),
        ('Bug Buster', 'Crush those fitness bugs by completing 100 squats in a row. No bugs will escape your leg day routine!', 'bugbuster', 0),
        ('Full Stack Flexer', 'Achieve the ultimate stack by doing a full set of deadlifts, squats, and bench press in a single workout. You´ll be a full-stack developer in the gym! (Mind the naming of your exercises to be as in the description)', 'fullstack', 0),
        ('RAM', 'Curl 50 kg for RepairArmMuscles (RAM).', 'ram', 0),
        ('Biceps Boss', 'Complete 1000 bicep curls and become the undisputed Bicep Boss.', 'bicepsboss1', 0),
        ('Biceps Master', 'Complete 2500 bicep curls and become the undisputed Bicep Master.', 'bicepsboss2', 0),
        ('Biceps Hero', 'Complete 5000 bicep curls and become the undisputed Bicep Hero.', 'bicepsboss3', 0);
      `);

    tableInitialisations += promise?.changes?.changes || 0;

    // promise = await databaseStore.getDatabase()
    //   ?.run(`INSERT INTO Weight (timestamp, weight)
    //   VALUES
    //   (datetime('now', '-1 days'), 77.7),
    //   (datetime('now', '-2 days'), 77.9),
    //   (datetime('now', '-3 days'), 77.6),
    //   (datetime('now', '-4 days'), 78.1);`);
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
      ?.getDatabase()
      ?.run(`Drop Table WorkoutList;`);
    tableDeletions += promise?.changes?.changes || 0;
    promise = await databaseStore
      ?.getDatabase()
      ?.run(`Drop Table WorkoutExercise;`);
    tableDeletions += promise?.changes?.changes || 0;
    promise = await databaseStore?.getDatabase()?.run(`Drop Table Exercise;`);
    tableDeletions += promise?.changes?.changes || 0;
    promise = await databaseStore?.getDatabase()?.run(`Drop Table Workout;`);
    tableDeletions += promise?.changes?.changes || 0;
    promise = await databaseStore
      ?.getDatabase()
      ?.run(`Drop Table WorkoutTemplatePlan;`);
    tableDeletions += promise?.changes?.changes || 0;
    promise = await databaseStore
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
