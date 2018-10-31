
<!--zookeeper 配置中心-->
<template>
  <!--main-->
  <div class="app-container calendar-list-container">

    <el-row>
      <github-corner style="position: absolute; top: 0px; border: 0; right: 0;"/>
      <!--左边-->
      <el-col :span="8" >
        <!--工具栏-->
        <div class="use-flex">
          <div>
            <el-input size="medium" :placeholder="$t('placeholder.pathFilter')" class="filter-item" v-model="fiterls"></el-input>
          </div>
          <div>
            <el-button-group v-if="authortiy.btn_add">
              <el-button  type="primary" @click="handDownLoad">{{$t('button.export')}}</el-button>
              <el-button  type="primary" @click="dialog.uploadTxt = true , upload.data = null, uploadSubimt = false" v-loading="dialog.uploadTxt">{{$t('button.import')}}</el-button>
              <el-tooltip effect="light" placement="top" :content="$t('tooltip.switchServer')">
                <el-button  type="warning" @click="convertServer">{{$t('button.switch')}}</el-button>
              </el-tooltip>
              <el-tooltip effect="light" placement="top" :content="$t('tooltip.addRootNode')" >
                <el-button  type="success" @click="addRootNode">{{$t('button.addRoot')}}</el-button>
              </el-tooltip>
            </el-button-group>
          </div>

        </div>

        <el-card style="margin-right:10px;">
          <div slot="header" class="clearfix">
            <span>SERVERS：  <b style="color: red">{{ZK_SERVERS?ZK_SERVERS :$t('loading.default')}}</b></span>
          </div>

          <el-tree
            :data="treeData"
            node-key="id"
            highlight-current
            :props="defaultProps"
            :expand-on-click-node="false"
            ref="treeData"
            render-after-expand
            accordion
            :filter-node-method="filterNode"
            v-loading="loading.treeLoading"
            :element-loading-text="$t('loading.tree')"
            element-loading-spinner="el-icon-loading"
            :render-content="renderContent"
          >
          </el-tree>
        </el-card>
      </el-col>
      <!--右边-->
      <el-col :span="16" >
        <sticky >
        <el-card style="height: 100%" >

          <div slot="header" class="clearfix">
            <span >{{$t('constants.formStatus.'+status)}}</span>
          </div>

          <keep-alive>
            <div>
              <el-form label-position="left" label-width="80px" v-model="form" v-loading="loading.formLoading" >
                <el-form-item  :label="$t('form.label.path')">
                  <el-input  v-model="form.path"  :disabled="status == 'edit'">
                    <template slot="prepend">{{form.parentPath}}</template>
                    <el-button type="primary" icon="document" slot="append"  v-clipboard:copy='form.parentPath +form.path' v-clipboard:success='clipboardSuccess'>copy</el-button>
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('form.label.data')">
                  <textarea  v-model="form.data" style="height: 400px" />
                </el-form-item>
                <el-form-item >
                  <el-tooltip effect="light" placement="top" :content="$t('constants.formStatus.'+status)"  v-if="authortiy.btn_edit">
                    <el-button type="primary" @click="status=='create'?handleCreate():hadnleUpdate()" v-loading="loading.submitLoading" >{{$t('constants.formStatus.'+status)}}</el-button>
                  </el-tooltip>
                </el-form-item>
              </el-form>
            </div>

          </keep-alive>

        </el-card>
        </sticky>

      </el-col>
    </el-row>

    <el-dialog  :title="$t('dialog.title.importConfig')"  :visible.sync="dialog.uploadTxt"   v-loading="loading.loading">
      <el-row  type="flex"  justify="center">
        <el-col  :span="8" >
          <div class="app-container" >
            <el-card style="margin-right:10px;">
              <el-tree
                :data="upload.childs"
                node-key="id"
                highlight-current
                :props="defaultProps"
                ref="uploadData"
                render-after-expand
                accordion
                :element-loading-text="$t('loading.tree')"
                element-loading-spinner="el-icon-loading"
              >
              </el-tree>
            </el-card>
          </div>
        </el-col>
        <el-col :span="16"  >
          <div class="app-container" >
            <upload-txt-component @on-selected-file='handUpload'></upload-txt-component>
          </div>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.uploadTxt = false">{{$t('button.cancel')}}</el-button>
        <el-button v-if="show.uploadSubimt" type="primary" @click="importZKNode">{{$t('button.upload')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Sticky from '@/components/Sticky' //为了给form表单做浮动处理
  import GithubCorner from '@/components/GithubCorner'
require("script-loader!file-saver");
import UploadTxtComponent from "./components/UploadTxt.vue";
import clip from "@/utils/clipboard"; // use clipboard directly
import clipboard from "@/directive/clipboard/index.js"; // use clipboard by v-directive
import {
  queryTree,
  getData,
  setData,
  remove,
  setServer,
  importZKNode
} from "./api/index";
let id = 1000;
const defaultForm = {
  parentPath: "/",
  path: undefined,
  data: undefined
};
export default {
  name: "zookeeper-index",
  props: {
    authortiy: {
      //权限控制ß
      type: Object,
      default: function() {
        return {
          btn_add: {
            type: Boolean,
            default: true
          },
          btn_edit: {
            type: Boolean,
            default: true
          },
          btn_del: {
            type: Boolean,
            default: true
          }
        };
      }
    }
  },
  directives: {
    clipboard
  },
  components: {
    UploadTxtComponent,
    GithubCorner,
    Sticky,
  },
  data() {
    return {
      ZK_SERVERS: undefined,
      ROOT_PATH: undefined,
      status: "edit",
      fiterls: "",
      treeData: [],
      defaultProps: {
        children: "childs",
        label: "path"
      },
      curNodeData: undefined,
      form: Object.assign({}, defaultForm),
      loading: {
        loading: false, //顶级遮盖层
        treeLoading: false,
        submitLoading: false,
        formLoading: false,
        loadLoding: false
      },
      show: {
        uploadSubimt: false
      },
      dialog: {
        uploadTxt: false
      },
      upload: {
        data: null,
        childs: []
      },
      download: {
        data: null
      }
    };
  },
  created() {
    this.getTree();
  },
  watch: {
    fiterls(val) {
      this.$refs.treeData.filter(val);
    }
  },
  filter: {
    labelConvert(val) {
      if (val.length > 15) {
        return val;
      }
      return val;
    }
  },
  methods: {
    getTree() {
      this.loading.treeLoading = true;
      this.loading.submitLoading = true;
      queryTree().then(res => {
        //当前服务
        this.ZK_SERVERS = res.data.data.curServsers;
        this.ROOT_PATH = res.data.data.ROOT + "/";
        //树节点
        this.download.data = res.data.data.ZKNode;
        let data = this.download.data.childs;
        this.treeData = data;
        this.loading.treeLoading = false;
        this.loading.submitLoading = false;
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.path.indexOf(value) !== -1;
    },
    //重构 树样式
    renderContent(h, { node, data, store }) {
      return (
        <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
          <span
            on-click={() => this.treeUpdate(node, data)}
            style="width: 100%;"
          >
            {node.label.length > 25
              ? node.label.substring(0, 25) + "……"
              : node.label}
          </span>
          <span>
            {this.authortiy.btn_add ? (
              <el-button
                style="font-size: 15px;"
                type="text"
                icon="el-icon-circle-plus"
                on-click={() => this.treeCreated(node, data)}
              />
            ) : (
              <span />
            )}

            {this.authortiy.btn_del ? (
              <el-button
                style="font-size: 15px;"
                type="text"
                icon="el-icon-remove"
                on-click={() => this.treeDelelte(node, data)}
              />
            ) : (
              <span />
            )}
          </span>
        </span>
      );
    },
    treeCreated(node, data) {
      //新增节点
      this.form = Object.assign({}, defaultForm);
      if (node.parent.data.fullPath) {
        this.form.parentPath =
          node.parent.data.fullPath + "/" + data.path + "/";
      } else {
        this.form.parentPath = this.ROOT_PATH + data.path + "/";
      }
      this.status = "create";
      this.curNodeData = data;
    },
    treeUpdate(node, data) {
      this.loading.formLoading = true;
      getData(data.fullPath).then(res => {
        this.loading.formLoading = false;
        if (res.data) {
          this.status = "edit";
          if (node.parent.data.fullPath) {
            this.form.parentPath = node.parent.data.fullPath + "/";
          } else {
            this.form.parentPath = this.ROOT_PATH;
          }
          this.form.path = data.path;
          this.form.data = res.data.data;
        }
      });
    },
    addRootNode() {
      this.form = Object.assign({}, defaultForm);
      this.form.parentPath = this.ROOT_PATH;
      this.status = "create";
    },
    handleCreate() {
      if (!this.form.path) {
        this.$message.error("path is not null");
        return;
      }
      let path = this.completePath(),
        data = this.form.data;
      this.loading.submitLoading = true;
      this.loading.formLoading = true;
      setData(path, data).then(res => {
        if (res.data.rel) {
          this.$notify({
            title: this.$t('notify.title.success'),
            message: this.$t('notify.message.create.success'),
            type: "success"
          });
          if (this.form.parentPath != this.ROOT_PATH) {
            //新增节点
            this.loading.treeLoading = true;
            const newChild = {
              id: id++,
              path: this.form.path,
              fullPath: path,
              childs: []
            };
            if (!this.curNodeData.childs) {
              this.$set(this.curNodeData, "childs", []);
            }
            this.curNodeData.childs.push(newChild);
            this.loading.treeLoading = false;
          } else {
            // ;加根节点就重新加载
            this.getTree();
          }
        }
        this.loading.formLoading = false;
        this.loading.submitLoading = false;
      });
    },
    hadnleUpdate() {
      if (!this.form.path) {
        this.$message.error("path is not null");
        return;
      }
      this.loading.submitLoading = true;
      this.loading.formLoading = true;
      let path = this.completePath(),
        data = this.form.data;
      setData(path, data).then(res => {
        if (res.status == 200) {
          this.$notify({
           title: this.$t('notify.title.success'),
            message: this.$t('notify.message.update.success'),
            type: "success"
          });
        }
        this.loading.formLoading = false;
        this.loading.submitLoading = false;
      });
    },
    treeDelelte(node, data) {
      this.$confirm(this.$t('confirm.message.treeDelete'), this.$t('confirm.title.prompt'), {
        confirmButtonText: this.$t('confirm.button.confim'),
        cancelButtonText: this.$t('confirm.button.cancel'),
      }).then(() => {
        this.loading.treeLoading = true;
        remove(data.fullPath).then(res => {
          if (res.status == 200) {
            this.$notify({
              title: this.$t('notify.title.success'),
              message: this.$t('notify.message.delete.success'),
              type: "success"
            });
            const parent = node.parent;
            const children = parent.data.childs || parent.data;
            const index = children.findIndex(d => d.path === data.path);
            children.splice(index, 1);
          }
          this.loading.treeLoading = false;
        });
      });
    },
    // 切换服务
    convertServer() {
      this.$prompt(this.$t('confirm.message.switchServer'), this.$t('confirm.title.prompt'), {
        confirmButtonText: this.$t('confirm.button.confirm'),
        cancelButtonText: this.$t('confirm.button.cancel'),
        inputValue: this.ZK_SERVERS
        // inputPattern: /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/,
        // inputErrorMessage: '请输入正确的url'
      }).then(({ value }) => {
        setServer(value).then(res => {
          if (res.data.rel) {
            this.$notify({
              title:  this.$t('notify.title.success'),
              message: this.$t('notify.message.switch.success'),
              type: "success"
            });
            this.getTree();
          } else {
            this.$notify({
              title:  this.$t('notify.title.success'),
              message: res.data.message,
              type: "error"
            });
          }
        });
      });
    },
    handleCopy(text, event) {
      clip(text, event);
    },
    clipboardSuccess() {
      this.$message({
        message: this.$t('message.copy'),
        type: "success",
        duration: 1500
      });
    },
    // //完整路径
    completePath() {
      return this.form.parentPath + this.form.path;
    },
    //导出txt文件 json格式
    handDownLoad() {
      let data = JSON.stringify(this.download.data);
      let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
      saveAs(blob, this.ZK_SERVERS + "-ZNodeData.txt");
    },
    handUpload(data) {
      this.upload.data = JSON.parse(data);
      this.upload.childs = this.upload.data.childs;
      this.show.uploadSubimt = true;
    },
    importZKNode() {
      this.loading.loading = true;
      importZKNode(this.upload.data)
        .then(res => {
          if (res.data.rel) {
            this.loading.loading = false;
            this.dialog.uploadTxt = false;
            this.$notify({
              title: this.$t('notify.title.success'),
              message: this.$t('notify.message。upload.success'),
              type: "success"
            });
            this.getTree();
          }
        })
        .catch(err => {
          this.loading.loading = false;
        });
    }
  }
};
</script>

<style scoped>
textarea {
  width: 100%;
  margin-bottom: 20px;
  line-height: 40px;
  padding: 0 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: inherit;
}
/*左边自适应*/
.use-flex {
  display: flex;
}
.use-flex > div:first-child {
  flex: 1;
}
.use-flex > div:last-child {
  flex: none;
  margin: 0px 5px;
}
</style>
