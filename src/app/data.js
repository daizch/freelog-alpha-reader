function createLoader(loader) {
  var loading = false;
  var handles = [];
  var value;

  return function (callback) {
    if (value) {
      callback(value)
    } else if (loading) {
      handles.push(callback)
    } else {
      loading = true;
      handles.push(callback)
      loader(function (v) {
        value = v;
        let h;
        while ((h = handles.shift())) {
          h(v)
        }
      })
    }
  }
}

var nodeId = window.__auth_info__.__auth_node_id__


function handleErrorResponse(res){
  window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', {
    response: res
  })
}

var onloadBookDetail = createLoader(function (callback) {
  window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${nodeId}&resourceType=json&tags=book`)
    .then(res => res.json())
    .then(res => {
      if (res.errcode === 0) {
        var presentable = res.data[0]
        window.FreelogApp.QI.fetch(`/v1/auths/presentable/${presentable.presentableId}?nodeId=${nodeId}`)
          .then(res => {
            var token = res.headers.get('freelog-sub-resource-auth-token')
            res.json().then(data => {
              if (data && !data.errcode) {
                data.authorImg = `/api/v1/auths/presentable/subResource/${data.authorImg}?token=${token}`
                callback(data)
              } else {
                handleErrorResponse(res)
              }
            })
          })
      } else {
        handleErrorResponse(res)
      }
    })
});


function loadPresentablesByTags(tags) {
  return window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${nodeId}&tags=${tags}`).then(res => res.json())
}

function resolveChapters(chapters) {
  var bookVolumesMap = {};
  var bookVolumes = []

  chapters.forEach(chapter => {
    var volume = chapter.resourceInfo.meta.volume
    if (volume) {
      if (!bookVolumesMap[volume]) {
        bookVolumesMap[volume] = []
      }
      bookVolumesMap[volume].push(chapter)
    }
  });

  Object.keys(bookVolumesMap).forEach(volume => {
    var chapterList = bookVolumesMap[volume];
    chapterList.sort(function (a, b) {
      return a.resourceInfo.meta.chapter > b.resourceInfo.meta.chapter
    })

    bookVolumes.push({
      volumeName: chapterList[0].resourceInfo.meta.volumeName,
      volumeIndex: volume,
      chapters: chapterList
    })
  })

  return bookVolumes
}


var onloadChapters = createLoader(function (callback) {
  window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${nodeId}&tags=chapter`)
    .then(res => res.json())
    .then(res => {
      if (res.errcode === 0) {
        var data = resolveChapters(res.data)
        callback(data)
      } else {
        handleErrorResponse(res)
      }
    })
});

function loadPresentableInfo(presentableId) {
  return window.FreelogApp.QI.fetch(`/v1/presentables/${presentableId}`).then(res => res.json())
}

function requestPresentableData(presentableId) {
  var nodeId = window.__auth_info__.__auth_node_id__
  return window.FreelogApp.QI.fetch(`/v1/auths/presentable/${presentableId}?nodeId=${nodeId}`)
    .then(res => {
      var meta = decodeURIComponent(res.headers.get('freelog-meta'))
      var chapter
      try {
        chapter = JSON.parse(meta)
      } catch (e) {
        chapter = null
      }
      if (!chapter) {
        return res.json().then(errResponse => {
          return loadPresentableInfo(presentableId)
            .then(res => {
              chapter = res.data.resourceInfo.meta || {
                "chapterName": "第一章 秦羽",
                "volume": 1,
                "chapter": 1,
                "volumeName": "秦羽"
              }
              chapter.presentableId = presentableId
              chapter.error = errResponse
              return chapter
            })
        })
      } else {
        return res.text().then(content => {
          chapter.content = content;
          return chapter
        })
      }
    })
}

var presentablesMap = {}

function onloadPresentableData(presentableId, disabledCache) {
  if (!disabledCache && presentablesMap[presentableId]) {
    return Promise.resolve(presentablesMap[presentableId])
  } else {
    return requestPresentableData(presentableId).then((chapter) => {
      presentablesMap[presentableId] = chapter
      return chapter
    })
  }
}
//alias
var onloadChapterContent = onloadPresentableData

export {
  onloadBookDetail,
  onloadChapters,
  loadPresentablesByTags,
  onloadPresentableData,
  onloadChapterContent
}
