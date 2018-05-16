<template>
  <el-aside width="100vw">
    <!-- logout button -->
    <el-button type="danger" size="mini" class="project-add-button" @click="logout()">ログアウト</el-button>
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
        <div class="node-tree__label">{{ node.label }}</div>
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
import moment from 'moment'
moment.locale('ja')

export default {
  data: () => ({
    filterKeyword: '',
    defaultProps: { children: 'children', label: 'name' },
    projectAddDialog: false,
    projectEditDialog: false,
    projectForm: { name: '', color: '', node: null, data: null },
    taskAddDialog: false,
    taskEditDialog: false,
    taskForm: { name: '', node: null, data: null }
  }),
  created() {
    this.getProjects()
  },
  watch: {
    filterKeyword(v) {
      this.$refs.taskTree.filter(v)
    }
  },
  computed: {
    ...mapGetters(['projects', 'targetEvent']),
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
    isParent(node) {
      return node.parent.data.children != null
    },
    ...mapActions({
      logout: 'LOGOUT',
      getProjects: 'GET_PROJECTS',
      addProjects: 'ADD_PROJECTS',
      editProjects: 'EDIT_PROJECTS',
      removeProjects: 'REMOVE_PROJECTS',
      addTasks: 'ADD_TASKS',
      editTasks: 'EDIT_TASKS',
      removeTasks: 'REMOVE_TASKS',
      getEvents: 'GET_EVENTS',
      setTargetTask: 'SET_TARGET_TASK'
    }),
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
      this.addProjects(obj)
      this.resetProjectForm()
      this.projectAddDialog = false
    },
    editProject() {
      const obj = { '.key': this.projectForm.data['.key'], name: this.projectForm.name, color: this.projectForm.color }
      this.editProjects(obj)
      this.resetProjectForm()
      this.getEvents()
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
          this.removeProjects(this.projectForm.data['.key'])
          this.getEvents()
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
      this.addTasks(obj)
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
      const index = children.findIndex(d => d.key === this.taskForm.data.key)
      const obj = { '.key': parent.data['.key'], name: this.taskForm.name, index: index }
      this.editTasks(obj)
      this.resetTaskForm()
      this.getEvents()
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
          const index = children.findIndex(d => d.key === this.taskForm.data.key)
          const obj = { '.key': parent.data['.key'], index: index, delete: true }
          this.removeTasks(obj)
          this.getEvents()
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
    nodeClick(data) {
      if (data.key == null) return
      const obj = {
        key: data.key,
        taskName: data.name,
        color: this.getColor(data.key)
      }
      this.setTargetTask({ targetTask: obj })
    },
    getColor(key) {
      let color = ''
      this.projects.some(v => {
        color = v.color
        if (v.children != null && v.children.findIndex(d => d.key === key) !== -1) return true
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

      &__label {
        user-select: none;
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

.el-form-item {
  margin-bottom: 10px;
}

.el-dialog__body {
  padding: 0 20px;
}

.el-dialog__footer {
  padding: 0 20px 10px 20px;
}
</style>
