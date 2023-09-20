<template>
	<view>
		<view class="hao-slider" @tap="changeSlider" :style="{'width':sliderWidth?sliderWidth+'rpx':'100%','height':sliderHeight+'rpx','background-color':sliderRightColor,'border-radius':borderRadius}">
			<view class="hao-slider-top" :style="{'width':sliderAcWidth+'rpx','background-color':sliderLeftColor,'border-radius':borderRadius}"></view>
			<view :style="{'position': 'relative','height':sliderHeight+'rpx'}">
				<image
				 v-if="imgSliderUrl&&!isSliderTop" 
				 :src="imgSliderUrl" 
				 :style="{'width':sliderBlockSize+'rpx','height':sliderBlockSize+'rpx','left':-(sliderBlockSize/2)+'rpx'}" 
				 class="hao-slider-block" 
				 @touchmove="sliderMove" 
				 @touchstart="sliderStart" 
				 @touchend="sliderEnd">
				</image>
				<image
				 v-if="imgSliderUrl&&isSliderTop" 
				 :src="imgSliderUrl" 
				 :style="{'position': 'absolute','width':sliderBlockSize+'rpx','height':sliderBlockSize+'rpx','left':-(sliderBlockSize/2)+'rpx','top':blockTop}" 
				 @touchmove="sliderMove" 
				 @touchstart="sliderStart" 
				 @touchend="sliderEnd">
				</image>
				<view
				 v-if="!imgSliderUrl&&!isSliderTop" 
				 :style="{'border-radius': '50%','width':sliderBlockSize+'rpx','height':sliderBlockSize+'rpx','left':-(sliderBlockSize/2)+'rpx','background-color':sliderBgColor,'box-shadow':sliderBlockShadow}" 
				 class="hao-slider-block" 
				 @touchmove="sliderMove" 
				 @touchstart="sliderStart" 
				 @touchend="sliderEnd">{{ Math.round(currentValue / step) * step }}</view>
				 <!-- @touchend="sliderEnd">{{ currentValue }}</view> -->
				<view
				  v-if="!imgSliderUrl&&isSliderTop" 
				  :style="{'position': 'absolute','border-radius': '50%','width':sliderBlockSize+'rpx','height':sliderBlockSize+'rpx','top':blockTop,'left':-(sliderBlockSize/2)+'rpx','background-color':sliderBgColor,'box-shadow':sliderBlockShadow}" 
				  @touchmove="sliderMove" 
				  @touchstart="sliderStart" 
				  @touchend="sliderEnd"></view>
			 
				<!-- <view class="hao-slider-currentValue" v-if="isTip" :style="{'top':tipTop,'font-size':tipSize+'rpx'}">{{currentValue}}</view> -->
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		name:'hao-slider',
		data(){
			return{
				sliderAcWidth:0,//滑块位置
				sliderMax:0,//滑动最大长度,rpx
				sliderOffset:0,//滑块偏移量,px
				isStopMove:false,//是否停止滑块移动
				currentValue:0,//当前值
			}
		},
		props:{
			//图片滑块
			imgSliderUrl:{
				type:String,
				default:''
			},
			//最大值
			max:{
				type:Number,
				default:100
			},
			//最小值
			min:{
				type:Number,
				default:0
			},
			//当前值
			value:{
				type:Number,
				default:0
			},
			//步长，取值必须大于 0，并且可被(max - min)整除
			step:{
				type:Number,
				default:1
			},
			//是否禁用
			isDisabled:{
				type:Boolean,
				default:false
			},
			//滑条高度(rpx)
			sliderHeight:{
				type:Number,
				default:8
			},
			//滑条宽度(rpx),默认100%
			sliderWidth:{
				type:Number,
				default:null
			},
			//滑块大小(rpx)
			sliderBlockSize:{
				type:Number,
				default:30
			},
			//滑块右侧背景色
			sliderRightColor:{
				type:String,
				default:'#e9e9e9'
			},
			//滑块左侧已选择背景色
			sliderLeftColor:{
				type:String,
				default:'#2e8857'
			},
			//滑块颜色
			sliderBgColor:{
				type:String,
				default:'#ffffff'
			},
			//滑块阴影(当滑块不是图片时有效)
			sliderBlockShadow:{
				type:String,
				default:'0 0 16rpx #fff'
			},
			//圆角值(rpx)
			borderRadius:{
				type:String,
				default:'8rpx'
			},
			//value提示的文字大小
			tipSize:{
				type:Number,
				default:22
			},
			//是否让滑块在滑条上方
			isSliderTop:{
				type:Boolean,
				default:false
			},
			//滑块离滑条的间距(isSliderTop为true时有效)
			topSpacing:{
				type:Number,
				default:8
			},
			//是否显示滑块上方当前值
			isTip:{
				type:Boolean,
				default:true
			},
			//提示值与滑块或滑条的间距
			tipBlockSpacing:{
				type:Number,
				default:20
			},
		},
		watch:{
			//当前值
			value(n,o){
				if(!this.isDisabled){
					this.valueChange()
				}
			}
		},
		mounted() {
			//获取video的位置信息
			uni.createSelectorQuery()
			.in(this)
			.select('.hao-slider')
			.boundingClientRect(rect => {
				let aa = parseInt(rect.width);
				let width = Number(aa)/(uni.upx2px(100)/100);
				this.sliderOffset = parseInt(rect.left);
				this.sliderMax = width;
				
				if(this.value >= this.min && this.value <= this.max){
					this.valueChange()
				}else{
					throw new Error('value应在min和max之间取值')
				}
			})
			.exec();
		},
		computed:{
			//步长值，rpx
			stepLength(){
				let gentle = this.max - this.min;//范围大小
				let partNum = gentle/this.step;//份数
				let length = this.sliderMax/partNum;//每步的长度。rpx
				// console.log('步长',length)
				return length;
				// if(length < 2){
				// 	return 2;
				// }else{
				// 	return parseInt(length);
				// }
			},
			//滑块垂直位置
			blockTop(){
				return (-this.sliderBlockSize-this.topSpacing)+'rpx';
			},
			//value值提示垂直位置
			tipTop(){
				if(this.isSliderTop){
					return (-(this.tipSize*1.5)-this.sliderBlockSize-this.topSpacing-this.tipBlockSpacing)+'rpx';
				}else{
					if(this.sliderHeight >= this.sliderBlockSize){
						return (-(this.tipSize*1.5)-this.tipBlockSpacing)+'rpx';
					}else{
						let hh = (this.sliderHeight - this.sliderBlockSize)/2;
						return (-(this.tipSize*1.5)-this.tipBlockSpacing + hh)+'rpx';
					}
				}
			},
		},
		methods:{
			//获取当前value值
			getCurrentValue(){
				return this.currentValue;
			},
			//value变动，滑块跟着位置变动
			valueChange(){
				if(this.isStopMove)return;//拖拽滑块时，不让滑块随value值改变而移动
				
				if(this.value < this.max && this.value > this.min){
					this.currentValue = this.value;
					let gentle = this.max - this.min;//范围大小
					let vvv = this.value - this.min;
					// let ff = (vvv/gentle).toFixed(2);//当前位置所处对应的百分比数
					let ff = vvv/gentle;//当前位置所处对应的百分比数
					let result = parseInt(ff*this.sliderMax);//当前位置
					this.judgmentJump(result)//移动
				}else if(this.value <= this.min){
					this.currentValue = this.min;
					this.sliderAcWidth = 0;
				}else{
					this.currentValue = this.max;
					this.sliderAcWidth = this.sliderMax;
					this.$emit('end')//结束
				}
				
			},
			//判断移动
			judgmentJump(result){
				let spacing = Math.abs(result-this.sliderAcWidth);//间距
				let num = spacing / this.stepLength;//跳转份数
				//滑动了很远
				if(num >= 1){
					let fuNum = parseInt(num);
					if(fuNum == num && num < (fuNum+0.5)){
						if(result <= this.sliderAcWidth){
							this.sliderAcWidth = this.sliderAcWidth - (this.stepLength*fuNum);//直接挺近到现在的位置
						}else{
							this.sliderAcWidth = this.sliderAcWidth + (this.stepLength*fuNum);//直接挺近到现在的位置
						}
					}else{
						if(result <= this.sliderAcWidth){
							this.sliderAcWidth = this.sliderAcWidth - (this.stepLength*(fuNum+1));//直接挺近到现在位置的更前一格
						}else{
							this.sliderAcWidth = this.sliderAcWidth + (this.stepLength*(fuNum+1));//直接挺近到现在位置的更后一格
						}
					}
				}else if(num > 0.5){
					//只变换一格
					if(result <= this.sliderAcWidth){
						this.sliderAcWidth -= this.stepLength;
					}else{
						this.sliderAcWidth += this.stepLength;
					}
				}	
			},
			//点击跳转滑块
			changeSlider(e){
				if(this.isDisabled)return;//禁用
				let pageX = parseInt(e.touches[0].pageX);//滑动的位置
				let result = (pageX-this.sliderOffset)/(uni.upx2px(100)/100);//转rpx
				// let ff = (result/this.sliderMax).toFixed(2);//当前位置所处对应的百分比数
				let ff = result/this.sliderMax;//当前位置所处对应的百分比数
				let percentage;
				if(ff >0 && ff < 1){
					percentage = parseInt(this.min+(this.max - this.min)* ff);
					this.sliderAcWidth = result;
				}else if(ff >= 1){
					percentage = this.max;
					this.sliderAcWidth = this.sliderMax;
				}else{
					percentage = this.min;
					this.sliderAcWidth = 0;
				}
				this.currentValue = percentage;
				this.$emit('change',percentage)

				
				
				if(this.sliderAcWidth == this.sliderMax){
					this.$emit('end')//结束
				}
			},
			//滑动滑块
			sliderMove(e){
				if(this.isDisabled)return;//禁用
				let pageX = parseInt(e.touches[0].pageX);//滑动的位置
				let result = (pageX-this.sliderOffset)/(uni.upx2px(100)/100);//转rpx
				if(0 < result && result < this.sliderMax){			
					this.judgmentJump(result)//移动
					
					// let ff = (result/this.sliderMax).toFixed(4);//当前位置所处对应的百分比数
					let ff = result/this.sliderMax;//当前位置所处对应的百分比数
					let percentage = parseInt(this.min+(this.max - this.min)* ff);
					this.currentValue = percentage;
					this.$emit('changeing',percentage)//返回当前值
				}else if(result <= 0){
					this.$emit('changeing',0)//返回当前值
					this.currentValue = this.min;
					this.sliderAcWidth = 0;
				}else{
					this.$emit('changeing',this.sliderMax)//返回当前值
					this.currentValue = this.max;
					this.sliderAcWidth = this.sliderMax;

					this.$emit('end')//结束
				}
			},
			//点击滑块
			sliderStart(){
				if(this.isDisabled)return;//禁用
				this.$emit('start')
				this.isStopMove = true;
			},
			//滑块滑动结束
			sliderEnd(){
				if(this.isDisabled)return;//禁用
				// let ff = (this.sliderAcWidth/this.sliderMax).toFixed(2);//当前位置所处对应的百分比数
				let ff = this.sliderAcWidth/this.sliderMax;//当前位置所处对应的百分比数
				let percentage;
				if(ff >0 && ff < 1){
					percentage = parseInt(this.min+(this.max - this.min)* ff);
				}else if(ff >= 1){
					percentage = this.max;
				}else{
					percentage = this.min;
				}
			
				this.$emit('change',percentage)
				this.currentValue = percentage;
				this.isStopMove = false;
				
				if(this.sliderAcWidth == this.sliderMax){
					this.$emit('end')//结束
				}
			},
		}
	}
</script>

<style lang="scss">
	.hao-slider{
		position:relative;
		display: flex;
		align-items: center;
		&-top{
			height: 100%;
			border-radius: 10rpx;
		}
		&-block{
			position: absolute;
			top:50%;
			transform: translateY(-50%);
		}
		&-currentValue{
			position: absolute;
			transform: translateX(-50%);
			color:#fff;
			padding: 6rpx 10rpx;
			border-radius:8rpx;
			background-color: rgba(0,0,0,0.6);
		}
	}
</style>