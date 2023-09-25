<script>
export default {
    onLaunch: function () {
        console.log('App Launch')
    },
    onShow: function () {
        console.log('App Show')
    },
    onHide: function () {
        console.log('App Hide')
    },
}
</script>

<style>
@import url('./module/css/base.less');
page {
    display: flex;
    height: 100%;
}

/*每个页面公共css */
uni-page-body {
    height: 100%;
    display: flex;
    width: 100%;
}
</style>
