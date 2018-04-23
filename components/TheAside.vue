<template>
  <el-aside width="100vw">
    <!-- search -->
    <el-input
      size="mini"
      placeholder="タスクを検索"
      v-model="filterKeyword">
    </el-input>
    <!-- project add button -->
    <el-button type="primary" size="mini" class="project-add-button" @click="projectAddDialog = true">新規プロジェクト追加</el-button>
    <!-- project tree -->
    <el-tree
      :data="projects"
      :props="defaultProps"
      :filter-node-method="filterTask"
      node-key="id"
      ref="taskTree"
      @node-click="taskClick">
      <span class="tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <el-button type="text" size="mini" @click.stop="editProjectButton(node, data)"><i class="el-icon-error"></i></el-button>
      </span>
    </el-tree>
    <!-- dialog - add project -->
    <el-dialog title="プロジェクト追加" width="35%" :visible.sync="projectAddDialog" :close-on-click-modal="false">
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
        <el-button @click="projectAddDialog = false">キャンセル</el-button>
        <el-button type="primary" @click="addProject" :disabled="false">追加</el-button>
      </span>
    </el-dialog>
    <!-- dialog - edit project -->
    <el-dialog title="プロジェクト編集" width="35%" :visible.sync="projectEditDialog" :close-on-click-modal="false">
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
        <el-button @click="projectEditDialog = false">キャンセル</el-button>
        <el-button type="danger" @click="deleteProject">削除</el-button>
        <el-button type="primary" @click="editProject" :disabled="false">更新</el-button>
      </span>
    </el-dialog>
  </el-aside>
</template>

<script>
import moment from 'moment'
moment.locale('ja')

export default {
  data() {
    return {
      filterKeyword: '',
      projects: [
        {
          id: moment().unix() + 1,
          label: 'Level one 1',
          color: '#900',
          children: [
            {
              id: moment().unix() + 2,
              label: 'Level two 1-1',
              color: '#090'
            }
          ]
        },
        {
          id: moment().unix() + 3,
          label: 'Level one 2',
          color: '#009',
          children: [
            {
              id: moment().unix() + 4,
              label: 'Level two 2-1',
              color: '#f00'
            },
            {
              id: moment().unix() + 5,
              label: 'Level two 2-2',
              color: '#0f0'
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      projectAddDialog: false,
      projectEditDialog: false,
      projectForm: {
        id: '',
        name: '',
        color: '',
        node: null,
        data: null
      }
    }
  },
  watch: {
    filterKeyword(v) {
      this.$refs.taskTree.filter(v)
    }
  },
  methods: {
    filterTask(v, d) {
      if (!v) return true
      return d.label.indexOf(v) !== -1
    },
    addProject() {
      const obj = {
        id: moment().unix(),
        label: this.projectForm.name,
        color: this.projectForm.color
      }
      this.projects.push(obj)
      this.resetProjectForm()
      this.projectAddDialog = false
    },
    editProject() {
      const parent = this.projectForm.node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === this.projectForm.data.id)
      const obj = {
        id: this.projectForm.id,
        label: this.projectForm.name,
        color: this.projectForm.color
      }
      children.splice(index, 1, obj)
      this.resetProjectForm()
      this.projectEditDialog = false
    },
    editProjectButton(node, data) {
      this.projectForm.id = data.id
      this.projectForm.name = data.label
      this.projectForm.color = data.color
      this.projectForm.node = node
      this.projectForm.data = data
      this.projectEditDialog = true
    },
    deleteProject() {
      const parent = this.projectForm.node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === this.projectForm.data.id)
      children.splice(index, 1)
    },
    resetProjectForm() {
      this.projectForm.id = ''
      this.projectForm.name = ''
      this.projectForm.color = ''
      this.projectForm.node = null
      this.projectForm.data = null
    },
    taskClick(data) {
      console.log(data)
    }
  }
}
</script>

<style lang="scss" scoped>
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

    .el-input__inner {
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

    span {
      user-select: none;
    }

    i {
      color: #606266;
    }
  }

  .tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
}
</style>

<style lang="scss">
.el-tree-node__content:hover {
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
