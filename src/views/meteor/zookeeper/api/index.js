import request from '@/utils/request'


const API_ROOT = "zk";

export function queryOtherMenu() {
  return request({
    url: API_ROOT + "otherMenu",
    method: 'get',
  })

}

//查询当前服务
export function queryServers() {
  return request({
    url: API_ROOT + "servers",
    method: 'get',
  })
}

//更改服务
export function  setServer(server) {
  let params = new URLSearchParams();
  params.append('server',server);
  return request.post(API_ROOT + "servers",params);
}


export  function queryTree(path) {

  return request({
    url:API_ROOT + "/tree",
    method:'get',
    params:{path:path}
  })
}

export function getData(path) {
  return request({
    url:API_ROOT + "/getData",
    method:'get',
    params:{path:path}
  })
}

export function setData(path,data) {
  return request({
    url:API_ROOT + "/setData",
    method:'post',
    params:{path:path ,data:data}
  })

}

export function remove(path) {
  return request({
    url:API_ROOT + "/remove",
    method:'delete',
    params:{path:path}
  })
}

export function  importZKNode(data) {
  return request({
    url:API_ROOT + '/import',
    method:'post',
    data:data
  })

}



