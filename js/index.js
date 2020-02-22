/*
    - 结构区别：
        前后均有一张假图
    - 运动设置
        - 父元素进行运动
            - xxx.style.transform = 'translateX(200px)';
            .box {
                transform: translateX(200px);
            }
    - 手势检测：
        - 左划、右划（相当于PC轮播图中左右按钮操作）
        - 通过touchstart和touchend的手指坐标进行比较，例如150以上说明手势触发
    - 具体操作
        - touchstart
            - 获取触摸时手指的坐标
        - touchmove
            - 实现拖拽手势
                - 实时获取手指最新坐标，并计算与初始位置的坐标差
                - 将坐标差设置给父元素进行跟随
        - touchend
            - 获取离开时的手指坐标
                - 确定是左滑还是右划
                - 根据手势设置父元素滚动到对应的图片显示位置
        - transitionend
            - 运动结束后判断当前显示图片是否为任意的假图
            - 如果是假图显示完毕，设置translateX为真图位置

        - 改进：
            - 由于移动端是通过3个事件实现的多种手势操作，会导致手势的功能出现冲突
            - 需要确保每次transition运动完毕后，才能进行下一次拖拽操作
                - 通过变量标记状态进行控制
                - flag
                    - true 表示可以执行拖拽
                    - false 表示不允许执行拖拽
            - 如果一次运动中触发多次滑动操作，会导致index改变
                - 确定一次滑动没有完毕后，也不能进行第二次滑动
*/

// 1 获取元素(移动端不需要考虑兼容)
var banner = document.querySelector('.banner'); // 可视区域
var imgWidth = banner.offsetWidth; // 获取可视区域宽度作为图片宽使用
var content = banner.children[0]; // 要运动的父元素
var items = content.children; // 6张图所在容器
// 2 设置变量控制左右操作
var index = 1; // 表示当前显示的元素的索引，默认显示第二个图，是真的第一张
// 3 设置touchstart事件，获取手指坐标
var x;
document.addEventListener('touchstart', function (e) {
    x = e.touches[0].clientX; // 获取初始触摸时的坐标
});

// 设置变量flag，默认为true，表示默认是可以进行拖拽的
var flag = true;


// 4 设置touchmove事件，设置拖拽手势
document.addEventListener('touchmove', function (e) {
    if (!flag) {
        // 说明不能执行拖拽的功能
        return;
    }
    // console.log('拖拽了');

    // 获取最新的手指坐标，并计算坐标差
    var cha = e.changedTouches[0].clientX - x;

    // 注意：滑动手势会设置过渡，但是拖拽手势不需要过渡，要清除过渡后再进行拖拽
    content.style.transition = 'none';

    // 设置给content进行显示即可
    //    - 设置cha进行拖拽时，需要基于当前图片显示的位置进行设置
    // - index * imgWidth 与前面的轮播图规则相同，可以表示当前元素的位置
    content.style.transform = 'translateX(' + (-index * imgWidth + cha) + 'px)';
});

// 5 设置touchend事件，设置划动手势
document.addEventListener('touchend', function (e) {
    if (!flag) {
        return;
    }

    // - 获取松手时的手指坐标，计算差值
    var cha = e.changedTouches[0].clientX - x;

    // - 检测是否满足滑动的范围(例如大于150)
    if (Math.abs(cha) > 150) {
        // 进一步检测左滑还是右划
        if (cha > 150) {
            // 右划：出现左侧的图片
            index--;
        } else if (cha < 150) {
            // 左滑：出现右侧的图片
            index++;
        }
    }

    // 设置transition进行过渡运动
    content.style.transition = '.5s';
    // 根据index设置运动
    var target = -index * imgWidth;
    content.style.transform = 'translateX(' + target + 'px)';

    // 触发了滑动手势操作，阻止拖拽功能的触发
    flag = false;
});

// 6 设置transitionend事件，设置抽回操作
//  - 当某次图片滚动完毕后，
//      检测，如果是假的最后一张或假的第一张，需要抽回到对应的真图的显示位置
content.addEventListener('transitionend', function () {
    // 检测index是否为0或5
    if (index === 0) {
        // 假的最后一张显示，设置index为4，items.length - 2
        index = items.length - 2;
    } else if (index === 5) { // 应当书写为items.length - 1
        // 假的第一张显示，设置index为1
        index = 1;
    }

    // 根据最新的index设置content抽回(不能进行过渡，直接设置tranlateX)
    content.style.transition = 'none';
    var target = -index * imgWidth;
    content.style.transform = 'translateX(' + target + 'px)';

    // 允许再次设置拖拽操作
    flag = true;
});
