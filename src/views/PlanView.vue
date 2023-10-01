<template>
  <ion-page style="height: calc(100vh - 100px)">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title v-if="plan">{{ plan.name }}- Plan</ion-title>
        <div class="icon">
          <ion-icon
            :icon="chevronBack"
            @click="router.go(-1)"
            size="large"
            color="primary"></ion-icon>
          <ion-label @click="router.go(-1)" color="primary">Cancel</ion-label>
        </div>
        <div class="icon" slot="end" style="margin-right: 16px">
          <ion-icon
            :icon="pencilOutline"
            @click="edit"
            style="font-size: 24px; margin-right: 8px"
            color="primary"></ion-icon>
          <ion-label @click="edit" color="primary">Edit</ion-label>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large" v-if="plan">{{ plan.name }}- Plan</ion-title>
        </ion-toolbar>
      </ion-header>
      <div style="padding-inline: 0.75rem">
        <ion-grid v-if="plan">
          <ion-row>
            <ion-col>
              <b>Description:</b>
              <br />
              {{ plan.description }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Type:</b>
              <br />
              {{ plan.type }}
            </ion-col>
            <ion-col>
              <b>Place:</b>
              <br />
              {{ plan.place }}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <b>Split:</b>
              <br />
              {{ plan.split }}
            </ion-col>
            <ion-col>
              <b>Scheme:</b>
              <br />
              {{ plan.scheme }}
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-list ref="list">
          <ion-list-header>
            <ion-label class="mt-0">Workout</ion-label>
            <ion-icon
              :icon="add"
              size="large"
              @click="addWorkoutModalOpen = true"
              class="ion-margin-end"></ion-icon>
            <ion-icon
              :icon="trashOutline"
              size="large"
              @click="deleteMode = !deleteMode"
              v-if="!deleteMode"
              class="ion-margin-end"></ion-icon>
            <ion-icon
              :icon="reorderThreeOutline"
              size="large"
              @click="deleteMode = !deleteMode"
              v-else
              class="ion-margin-end"></ion-icon>
          </ion-list-header>
          <ion-reorder-group
            v-if="!deleteMode"
            :disabled="false"
            @ionItemReorder="handleReorder($event)">
            <ion-item v-for="workout in workouts" key="workout.OrderIndex">
              <ion-label>{{ workout.WorkoutTemplateName }} </ion-label>
              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
          </ion-reorder-group>
          <ion-item-sliding
            v-else
            v-for="workout in workouts"
            key="workout.OrderIndex">
            <ion-item>
              <ion-label>{{ workout.WorkoutTemplateName }} </ion-label>
              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger">
                <ion-button
                  @click="
                    deleteWorkout(
                      workout.WorkoutTemplateName,
                      workout.OrderIndex
                    )
                  "
                  color="transparent"
                  id="colorpickerTrigger">
                  <ion-icon
                    slot="icon-only"
                    :icon="trashOutline"
                    style="font-size: 36px"></ion-icon>
                </ion-button>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </div>
    </ion-content>

    <ion-modal ref="modal" :isOpen="modalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="cancel()">
              <ion-icon slot="start" :icon="chevronBack"></ion-icon>
              Cancel
            </ion-button>
          </ion-buttons>
          <ion-title>Edit Plan</ion-title>
          <ion-buttons slot="end">
            <ion-button :strong="true" @click="confirmModal()">
              <ion-icon slot="end" :icon="saveOutline"></ion-icon>
              Save
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-textarea
            label="Description"
            :auto-grow="true"
            v-model="plan.description"
            :rows="1">
          </ion-textarea>
        </ion-item>
        <ion-item>
          <!-- <ion-input label="Type" v-model="plan.type"></ion-input> -->
          <ion-select
            label="Choose your Plan Type"
            interface="action-sheet"
            :value="plan.type"
            @ionChange="plan.type = $event.target.value">
            <ion-select-option value="Strength training">
              Strength Training
            </ion-select-option>
            <ion-select-option value="Mass training">
              Mass Training
            </ion-select-option>
            <ion-select-option value="Cut training">
              Cut Training
            </ion-select-option>
            <ion-select-option value="Cardio">Cardio</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <!-- <ion-input label="Place" v-model="plan.place"></ion-input> -->
          <ion-select
            label="Choose your Llace"
            interface="action-sheet"
            :value="plan.place"
            @ionChange="plan.place = $event.target.value">
            <ion-select-option value="Gym"> Gym </ion-select-option>
            <ion-select-option value="Calisthenic Park">
              Calisthenic Park
            </ion-select-option>
            <ion-select-option value="Home"> Home </ion-select-option>
            <ion-select-option value="Outdoor">Outdoor</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <!-- <ion-input label="Split" v-model="plan.split"></ion-input> -->
          <ion-select
            label="Choose your Split"
            interface="action-sheet"
            :value="plan.split"
            @ionChange="plan.split = $event.target.value">
            <ion-select-option value="1-way split">
              1-way split
            </ion-select-option>
            <ion-select-option value="2-way split">
              2-way split
            </ion-select-option>
            <ion-select-option value="3-way split">
              3-way split
            </ion-select-option>
            <ion-select-option value="4-way split">
              4-way split
            </ion-select-option>
            <ion-select-option value="5-way split">
              5-way split
            </ion-select-option>
            <ion-select-option value="6-way-split">
              6-way-split
            </ion-select-option>
            <ion-select-option value="7-waysplit">
              7-waysplit
            </ion-select-option>
            <ion-select-option value="8-way split">
              8-way split
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-content>
    </ion-modal>

    <ion-modal ref="addWorkoutModal" :isOpen="addWorkoutModalOpen">
      <ion-header>
        <ion-toolbar>
          <div class="icon">
            <ion-icon
              :icon="chevronBack"
              @click="addWorkoutModalOpen = false"
              size="large"
              color="primary"></ion-icon>
            <ion-label @click="addWorkoutModalOpen = false" color="primary">
              Cancel
            </ion-label>
          </div>
          <ion-title>Add Workout</ion-title>
          <div class="icon" slot="end" style="margin-right: 16px">
            <ion-label @click="addNewWorkouts" color="primary">Save</ion-label>
            <ion-icon
              :icon="saveOutline"
              @click="addNewWorkouts"
              style="font-size: 24px; margin-left: 8px"
              color="primary"></ion-icon>
          </div>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-checkbox
            v-model="selectedWorkouts['Restday']"
            label-placement="end"
            justify="start">
            Restday
          </ion-checkbox>
        </ion-item>
        <ion-item v-for="workout in workouttemplates" :key="workout.Name">
          <ion-checkbox
            v-model="selectedWorkouts[workout.Name]"
            label-placement="end"
            justify="start">
            {{ workout.Name }}
          </ion-checkbox>
        </ion-item>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { useDatabaseStore } from "@/stores/databaseStore";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonReorderGroup,
  IonReorder,
  IonList,
  IonListHeader,
  IonItem,
  IonButtons,
  IonButton,
  IonModal,
  IonTextarea,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import {
  chevronBack,
  pencilOutline,
  add,
  saveOutline,
  trashOutline,
  reorderThreeOutline,
} from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import { store } from "@/stores/IonicStorage";

const router = useRouter();
const databaseStore = useDatabaseStore();
const route = useRoute();
const modalOpen = ref(false);
const addWorkoutModalOpen = ref(false);
const deleteMode = ref(false);

const plan = ref();
const workouts = ref();
const workouttemplates = ref();

let selectedWorkouts: Record<string, boolean> = {};

const list = ref();

const loadPlan = async () => {
  const query = `SELECT * FROM Plan WHERE ID = ${route.params.id}`;
  const resp = await databaseStore.getDatabase()?.query(query);
  plan.value = resp?.values
    ? resp.values[0]
    : {
        name: "NotFound",
        ID: 0,
        description: "NotFound",
        type: "NotFound",
        place: "NotFound",
        split: "NotFound",
        scheme: "NotFound",
      };
};

const loadWorkouts = async () => {
  const query = `SELECT WorkoutTemplateName, OrderIndex FROM WorkoutTemplatePlan WHERE PlanID = ${plan.value.ID}`;
  const resp = await databaseStore.getDatabase()?.query(query);
  const ws = resp?.values ? resp.values : [];

  ws.sort((a: any, b: any) => {
    return a.OrderIndex - b.OrderIndex;
  });

  // Iterate through plan.value.scheme. If t, insert first element of ws and remove ist. if R, insert {WorkoutTemplateName: 'Restday'}. Make OrderIndex rising.
  const newWs = [];
  for (let i = 0; i < plan.value.scheme.length; i++) {
    if (plan.value.scheme[i] === "t") {
      newWs.push({
        WorkoutTemplateName: ws[0].WorkoutTemplateName,
        OrderIndex: i,
      });
      ws.shift();
    } else if (plan.value.scheme[i] === "r") {
      newWs.push({ WorkoutTemplateName: "Restday", OrderIndex: i });
    }
  }

  workouts.value = newWs;
};

const loadAllWorkouts = async () => {
  const query = `SELECT * FROM WorkoutTemplate`;
  const resp = await databaseStore.getDatabase()?.query(query);
  workouttemplates.value = resp?.values ? resp.values : [];
};

onBeforeMount(async () => {
  await loadPlan();
  await loadWorkouts();
  await loadAllWorkouts();

  selectedWorkouts.Restday = false;
  // add key in selectedWorkouts for each workouttemplate
  selectedWorkouts = {
    ...selectedWorkouts, // all existing keys
    ...workouttemplates.value.reduce(
      (acc: { [x: string]: boolean }, workout: { Name: string | number }) => {
        acc[workout.Name] = false;
        return acc;
      },
      {}
    ),
  };

  console.log(selectedWorkouts);
});

const handleReorder = async (event: CustomEvent) => {
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  await console.log(
    "Dragged from index",
    event.detail.from,
    "to",
    event.detail.to
  );

  const to = event.detail.to;
  const from = event.detail.from;

  const ind = workouts.value.findIndex(
    (w: { OrderIndex: any }) => w.OrderIndex === from
  );
  const draggedItem = workouts.value[ind].WorkoutTemplateName;
  console.log(draggedItem);

  if (from < to) {
    for (let i = from; i < to; i++) {
      const index = workouts.value.findIndex(
        (w: { OrderIndex: any }) => w.OrderIndex === i + 1
      );
      console.log(i - 1, workouts.value[index]);
      workouts.value[index].OrderIndex = i;
    }
    workouts.value[ind].OrderIndex = to;
  } else if (from > to) {
    for (let i = from - 1; i >= to; i--) {
      const index = workouts.value.findIndex(
        (w: { OrderIndex: any }) => w.OrderIndex === i
      );
      console.log(i + 1, workouts.value[index]);
      workouts.value[index].OrderIndex = i + 1;
    }
    workouts.value[ind].OrderIndex = to;
  }

  let newScheme = "";
  let dbOrderIndex = 0;
  for (let i = 0; i < workouts.value.length; i++) {
    const itemIndex = workouts.value.findIndex(
      (w: { OrderIndex: any }) => w.OrderIndex === i
    );

    if (workouts.value[itemIndex].WorkoutTemplateName === "Restday") {
      newScheme += "r";
    } else {
      newScheme += "t";
      const query = `UPDATE WorkoutTemplatePlan SET OrderIndex = ${dbOrderIndex} WHERE PlanID = ${plan.value.ID} AND WorkoutTemplateName = '${workouts.value[itemIndex].WorkoutTemplateName}'`;
      console.log(query);
      await databaseStore.getDatabase()?.query(query);
      dbOrderIndex += 1;
    }
  }

  plan.value.scheme = newScheme;
  const query = `UPDATE Plan SET Scheme = '${newScheme}' WHERE ID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.query(query);

  await event.detail.complete();
};

const edit = () => {
  modalOpen.value = true;
};

const confirmModal = async () => {
  modalOpen.value = false;
  // Save everything to database
  const query = `UPDATE Plan SET Description = '${plan.value.description}', Type = '${plan.value.type}', Place = '${plan.value.place}', Split = '${plan.value.split}' WHERE ID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.query(query);
};

const cancel = async () => {
  modalOpen.value = false;
};

const addNewWorkouts = async () => {
  addWorkoutModalOpen.value = false;
  // Save everything to database

  // get amount of t in plan.scheme
  const t = plan.value.scheme.split("t").length - 1;

  let dbOrderIndex = t;
  for (const [key, value] of Object.entries(selectedWorkouts)) {
    if (value) {
      if (key !== "Restday") {
        const query = `INSERT INTO WorkoutTemplatePlan (PlanID, WorkoutTemplateName, OrderIndex) VALUES (${plan.value.ID}, '${key}', ${dbOrderIndex})`;
        await databaseStore.getDatabase()?.query(query);
        dbOrderIndex += 1;
      }

      selectedWorkouts[key] = false;

      // update scheme
      plan.value.scheme += key === "Restday" ? "r" : "t";

      // save scheme to database
      const query2 = `UPDATE Plan SET Scheme = '${plan.value.scheme}' WHERE ID = ${plan.value.ID}`;
      await databaseStore.getDatabase()?.query(query2);
    }
  }

  await loadWorkouts();
};

const deleteWorkout = async (workoutName: string, OrderIndex: number) => {
  const query = `DELETE FROM WorkoutTemplatePlan WHERE PlanID = ${plan.value.ID} AND WorkoutTemplateName = '${workoutName}'`;
  await databaseStore.getDatabase()?.run(query);

  workouts.value = workouts.value.filter(
    (w: { OrderIndex: number }) => w.OrderIndex !== OrderIndex
  );

  // update scheme- build new scheme from workouts
  let newScheme = "";
  for (let i = 0; i < workouts.value.length; i++) {
    if (workouts.value[i].WorkoutTemplateName === "Restday") {
      newScheme += "r";
    } else {
      newScheme += "t";
    }
  }

  plan.value.scheme = newScheme;

  await loadWorkouts();

  // save scheme to database
  const query2 = `UPDATE Plan SET Scheme = '${newScheme}' WHERE ID = ${plan.value.ID}`;
  await databaseStore.getDatabase()?.run(query2);
};
</script>

<style scoped>
.icon {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
