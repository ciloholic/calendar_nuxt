<template>
  <el-aside width="100vw">
    <div class="button-group">
      <!-- option button -->
      <el-button type="info" size="mini" @click="optionDialog = true">オプション</el-button>
      <!-- logout button -->
      <el-button type="danger" size="mini" @click="logout()">ログアウト</el-button>
    </div>
    <!-- search -->
    <el-input size="mini" placeholder="タスクを検索" v-model="filterKeyword"></el-input>
    <!-- project add button -->
    <el-button type="primary" size="mini" class="project-add-button" @click="projectAddDialog = true">新規プロジェクト追加</el-button>
    <!-- project node tree -->
    <el-tree
      :data="showProjects"
      :props="defaultProps"
      :filter-node-method="filterTask"
      node-key=".key"
      ref="taskTree"
      @node-click="nodeClick">
      <div class="node-tree" slot-scope="{ node, data }">
        <div class="label" :class="{child: isParent(node)}">{{ node.label }}</div>
        <el-button v-if="!isParent(node)" type="text" size="mini" class="add-button" @click.stop="addTaskButton(node, data)">
          <i class="el-icon-plus"></i>
        </el-button>
        <el-button v-if="!isParent(node)" type="text" size="mini" @click.stop="editProjectButton(node, data)">
          <i class="el-icon-edit"></i>
        </el-button>
        <el-button v-if="isParent(node)" type="text" size="mini" @click.stop="editTaskButton(node, data)">
          <i class="el-icon-edit"></i>
        </el-button>
      </div>
    </el-tree>
    <!-- dialog - option -->
    <el-dialog custom-class="option" title="オプション" width="30%" :visible.sync="optionDialog" :before-close="beforeClose">
      <el-form :model="optionForm">
        <el-form-item label="土日" label-width="30%">
          <el-switch
            v-model="optionForm.weekday"
            @change="updateOption"
            active-text="表示"
            inactive-text="非表示">
          </el-switch>
        </el-form-item>
        <el-form-item label="開始時刻" label-width="30%">
          <el-time-select
            placeholder="Start time"
            v-model="optionForm.startTime"
            @change="updateOption"
            :picker-options="{ start: '00:00', step: '01:00', end: '11:00' }"
            :clearable="false">
          </el-time-select>
        </el-form-item>
        <el-form-item label="終了時刻" label-width="30%">
          <el-time-select
            placeholder="End time"
            v-model="optionForm.endTime"
            @change="updateOption"
            :picker-options="{ start: '18:00', step: '01:00', end: '23:00', minTime: optionForm.startTime}"
            :clearable="false">
          </el-time-select>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- dialog - add project -->
    <el-dialog title="プロジェクト追加" width="35%" :visible.sync="projectAddDialog">
      <el-form :model="projectForm">
        <el-form-item label="プロジェクト名:">
          <el-input v-model="projectForm.name"></el-input>
        </el-form-item>
        <el-form-item label="カラーコード:">
          <el-color-picker v-model="projectForm.color">
          </el-color-picker>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="projectAddDialog = false;resetProjectForm();">キャンセル</el-button>
        <el-button type="primary" @click="addProject" :disabled="disableProjectButton()">追加</el-button>
      </span>
    </el-dialog>
    <!-- dialog - edit project -->
    <el-dialog title="プロジェクト編集" width="35%" :visible.sync="projectEditDialog">
      <el-form :model="projectForm">
        <el-form-item label="プロジェクト名:">
          <el-input v-model="projectForm.name"></el-input>
        </el-form-item>
        <el-form-item label="カラーコード:">
          <el-color-picker v-model="projectForm.color">
          </el-color-picker>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="projectEditDialog = false;resetProjectForm();">キャンセル</el-button>
        <el-button type="danger" @click="removeProject">削除</el-button>
        <el-button type="primary" @click="editProject" :disabled="disableProjectButton()">更新</el-button>
      </span>
    </el-dialog>
    <!-- dialog - add task -->
    <el-dialog title="タスク追加" width="35%" :visible.sync="taskAddDialog">
      <el-form :model="taskForm">
        <el-form-item label="タスク名:">
          <el-input v-model="taskForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="taskAddDialog = false;resetTaskForm();">キャンセル</el-button>
        <el-button type="primary" @click="addTask" :disabled="disableTaskButton()">追加</el-button>
      </span>
    </el-dialog>
    <!-- dialog - edit task -->
    <el-dialog title="タスク編集" width="35%" :visible.sync="taskEditDialog">
      <el-form :model="taskForm">
        <el-form-item label="タスク名:">
          <el-input v-model="taskForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="taskEditDialog = false;resetTaskForm();">キャンセル</el-button>
        <el-button type="danger" @click="removeTask">削除</el-button>
        <el-button type="primary" @click="editTask" :disabled="disableTaskButton()">更新</el-button>
      </span>
    </el-dialog>
  </el-aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data: () => ({
    filterKeyword: '',
    defaultProps: { children: 'children', label: 'name' },
    optionDialog: false,
    projectAddDialog: false,
    projectEditDialog: false,
    projectForm: { name: '', color: '', node: null, data: null },
    taskAddDialog: false,
    taskEditDialog: false,
    taskForm: { name: '', node: null, data: null }
  }),
  created() {
    // オプション取得
    this.getOptionAction()
    // プロジェクト取得
    this.getProjectsAction()
  },
  watch: {
    filterKeyword(v) {
      this.$refs.taskTree.filter(v)
    }
  },
  computed: {
    ...mapGetters(['user', 'projects', 'targetEvent', 'optionForm']),
    showProjects: function() {
      const projects = this.projects.filter(v => !v.delete)
      return projects.map(v => {
        let project = Object.assign({}, v)
        if (v.children != null) {
          project.children = v.children.filter(vv => !vv.delete)
        }
        return project
      })
    }
  },
  methods: {
    ...mapActions({
      logout: 'LOGOUT',
      getProjectsAction: 'GET_PROJECTS',
      addProjectAction: 'ADD_PROJECT',
      editProjectAction: 'EDIT_PROJECT',
      removeProjectAction: 'REMOVE_PROJECT',
      addTaskAction: 'ADD_TASK',
      editTaskAction: 'EDIT_TASK',
      removeTaskAction: 'REMOVE_TASK',
      getEventsAction: 'GET_EVENTS',
      setTargetTaskAction: 'SET_TARGET_TASK',
      setOptionAction: 'SET_OPTION',
      getOptionAction: 'GET_OPTION',
      updateCalendarAction: 'UPDATE_CALENDAR'
    }),
    isParent(node) {
      return node.parent.data.children != null
    },
    filterTask(v, d) {
      if (!v) return true
      return d.name.indexOf(v) !== -1
    },
    addProject() {
      const obj = {
        name: this.projectForm.name,
        color: this.projectForm.color,
        delete: false
      }
      this.addProjectAction(obj)
      this.resetProjectForm()
      this.projectAddDialog = false
    },
    editProject() {
      const obj = { '.key': this.projectForm.data['.key'], name: this.projectForm.name, color: this.projectForm.color }
      this.editProjectAction(obj)
      this.resetProjectForm()
      this.getEventsAction(this.user)
      this.projectEditDialog = false
    },
    editProjectButton(node, data) {
      this.projectForm.name = data.name
      this.projectForm.color = data.color
      this.projectForm.node = node
      this.projectForm.data = data
      this.projectEditDialog = true
    },
    removeProject() {
      this.$confirm('本当にプロジェクトを削除しますか？', '確認', {
        confirmButtonText: 'はい',
        cancelButtonText: 'いいえ',
        type: 'warning'
      })
        .then(() => {
          this.removeProjectAction(this.projectForm.data['.key'])
          this.getEventsAction(this.user)
          this.projectEditDialog = false
          this.$message({ type: 'success', message: '削除しました' })
        })
        .catch(() => {
          this.$message({ type: 'info', message: 'キャンセルしました' })
        })
    },
    disableProjectButton() {
      return !(
        this.projectForm.name != null &&
        this.projectForm.color != null &&
        this.projectForm.name.length > 0 &&
        this.projectForm.color.length > 0
      )
    },
    resetProjectForm() {
      this.projectForm.name = ''
      this.projectForm.color = ''
      this.projectForm.node = null
      this.projectForm.data = null
    },
    addTask() {
      const obj = { '.key': this.taskForm.data['.key'], name: this.taskForm.name }
      this.addTaskAction(obj)
      this.resetTaskForm()
      this.taskAddDialog = false
    },
    addTaskButton(node, data) {
      this.taskForm.name = ''
      this.taskForm.node = node
      this.taskForm.data = data
      this.taskAddDialog = true
    },
    editTask() {
      const parent = this.taskForm.node.parent
      const children = parent.data.children
      const index = children.findIndex(d => d.id === this.taskForm.data.id)
      const obj = { '.key': parent.data['.key'], name: this.taskForm.name, index: index }
      this.editTaskAction(obj)
      this.resetTaskForm()
      this.getEventsAction(this.user)
      this.taskEditDialog = false
    },
    editTaskButton(node, data) {
      this.taskForm.name = data.name
      this.taskForm.node = node
      this.taskForm.data = data
      this.taskEditDialog = true
    },
    removeTask() {
      this.$confirm('本当にタスクを削除しますか？', '確認', {
        confirmButtonText: 'はい',
        cancelButtonText: 'いいえ',
        type: 'warning'
      })
        .then(() => {
          const parent = this.taskForm.node.parent
          const children = parent.data.children
          const index = children.findIndex(d => d.id === this.taskForm.data.id)
          const obj = { '.key': parent.data['.key'], index: index, delete: true }
          this.removeTaskAction(obj)
          this.getEventsAction(this.user)
          this.taskEditDialog = false
          this.$message({ type: 'success', message: '削除しました' })
        })
        .catch(() => {
          this.$message({ type: 'info', message: 'キャンセルしました' })
        })
    },
    disableTaskButton() {
      return !(this.taskForm.name != null && this.taskForm.name.length > 0)
    },
    resetTaskForm() {
      this.taskForm.name = ''
      this.taskForm.node = null
      this.taskForm.data = null
    },
    beforeClose: function() {
      this.optionDialog = false
    },
    updateOption() {
      this.setOptionAction()
      this.updateCalendarAction(true)
    },
    nodeClick(data) {
      if (data.id == null) return
      const obj = {
        id: data.id,
        taskName: data.name,
        color: this.getColor(data.id)
      }
      this.setTargetTaskAction({ targetTask: obj })
    },
    getColor(id) {
      let color = ''
      this.projects.some(v => {
        color = v.color
        if (v.children != null && v.children.findIndex(d => d.id === id) !== -1) return true
      })
      return color
    }
  }
}
</script>

<style lang="scss" scoped>
.el-button + .el-button {
  margin-left: 5px;
}

.el-aside {
  background: rgba(255, 255, 255, 0.15);
  grid-area: aside;
  height: calc(100vh - 40px);
  border-radius: 3px;
  padding: 10px;

  .el-input {
    color: #fff;
    background: #332a25;
    margin-bottom: 10px;

    &__inner {
      border-radius: 3px;
    }
  }

  .button-group {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;

    .el-button {
      flex: auto;
    }
  }

  .project-add-button {
    width: 100%;
    margin-bottom: 10px;
  }

  .el-tree {
    margin-bottom: 10px;
    border-radius: 3px;

    .node-tree {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;

      i {
        color: #606266;
      }

      .label {
        max-width: 15rem;
        font-size: 0.8em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;

        &.child {
          font-size: 0.5em;
        }
      }

      .add-button {
        margin-left: auto;
      }
    }
  }
}
</style>

<style lang="scss">
.el-node-tree__content:hover {
  border-radius: 3px;
}

.el-tree-node__expand-icon.is-leaf {
  padding: 6px 0;
}

.el-form-item {
  margin-bottom: 10px;
}

.el-dialog__body {
  padding: 0 20px;
}

.el-dialog.option > .el-dialog__body {
  padding: 0 20px 10px 20px;
}

.el-dialog__footer {
  padding: 0 20px 10px 20px;
}
</style>
