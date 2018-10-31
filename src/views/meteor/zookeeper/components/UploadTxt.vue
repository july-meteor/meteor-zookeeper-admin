<template>
  <div>
    <input id="excel-upload-input" ref="excel-upload-input" type="file" accept=".text, .txt" class="c-hide" @change="handkeFileChange">
    <div id="drop" @drop="handleDrop" @dragover="handleDragover" @dragenter="handleDragover">
      Drop excel file here or
      <el-button style="margin-left:16px;" size="mini" type="primary" @click="handleUpload">browse</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        loading: false,
        data :null,
      }
    },
    methods: {
      generateDate(results) {
        this.$emit('on-selected-file', results)
      },
      handleDrop(e) {
        e.stopPropagation()
        e.preventDefault()
        const files = e.dataTransfer.files
        if (files.length !== 1) {
          this.$message.error('Only support uploading one file!')
          return
        }
        const itemFile = files[0] // only use files[0]
        this.readerData(itemFile)
        e.stopPropagation()
        e.preventDefault()
      },
      handleDragover(e) {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      },
      handleUpload() {
        document.getElementById('excel-upload-input').click()
      },
      handkeFileChange(e) {
        const files = e.target.files
        const itemFile = files[0] // only use files[0]
        if (!itemFile) return
        this.readerData(itemFile)
        this.$refs['excel-upload-input'].value = null // fix can't select the same excel
      },
      readerData(itemFile) {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          this.generateDate(data);
        }
        reader.readAsText(itemFile,"utf-8");
      },
      fixdata(data) {
        let o = ''
        let l = 0
        const w = 10240
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
        return o
      },

    }
  }
</script>

<style scoped>
  #excel-upload-input{
    display: none;
    z-index: -9999;
  }
  #drop{
    border: 2px dashed #bbb;
    width: 600px;
    height: 160px;
    line-height: 160px;
    margin: 0 auto;
    font-size: 24px;
    border-radius: 5px;
    text-align: center;
    color: #bbb;
    position: relative;
  }
</style>
