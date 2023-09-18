<template>
	<view class="zero_switch" :class="[disabled?'zero_switch_disabled':'']"
		:style="{background:checked?backgroundColorOn:backgroundColorOff,borderColor:checked?borderColorOn:borderColorOff,width:2*size+2+'px',height:size+4+'px',borderRadius:size+'px'}"
		@click="onChange">
		<view class="dot" :class="[checked?'dot_act':'',{'moon':moon},{'moon_act':checked&&moon}]"
			:style="{background:checked?activeColor:inactiveColor,width:size-2+'px',height:size-2+'px'}">
		</view>
		<view class="text" v-if="showText && !moon"
			:style="{color:checked?activeColor:inactiveColor,lineHeight:size+2+'px',fontSize:size-11+'px'}">
			<!-- :style="{width:size+'px'}" -->
			<view v-if="checked" class="text_on" :style="{width:size-10+'px'}">
				{{textOn}}
			</view>
			<view v-else class="text_off" :style="{width:size-10+'px'}">
				{{textOff}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "zero-switch",
		emits: ['input', 'update:modelValue', 'change'],
		model: {
			prop: 'modelValue',
			event: 'update:modelValue'
		},
		props: {
			value: {
				type: Boolean,
				default: false,
			},
			modelValue: {
				type: Boolean,
				default: false,
			},
			activeColor: {
				type: String,
				default: "#007aff",
			},
			inactiveColor: {
				type: String,
				default: "#cccccc",
			},
			backgroundColorOn: {
				type: String,
				default: "#ffffff",
			},
			backgroundColorOff: {
				type: String,
				default: "#ffffff",
			},
			borderColorOn: {
				type: String,
				default: '#eeeeee'
			},
			borderColorOff: {
				type: String,
				default: '#eeeeee'
			},
			showText: {
				type: Boolean,
				default: false,
			},
			textOn: {
				type: String,
				default: "开",
			},
			textOff: {
				type: String,
				default: "关",
			},
			size: {
				type: Number,
				default: 26,
			},
			disabled: {
				type: Boolean,
				default: false,
			},
			stopChange: {
				type: Boolean,
				default: false,
			},
			moon: {
				type: Boolean,
				default: false,
			}
		},
		data() {
			return {
				checked: false
			};
		},
		beforeMount() {
			this.checked = this.value || this.modelValue
		},
		watch: {
			value(newValue) {
				this.checked = newValue
			},
			modelValue(newValue) {
				this.checked = newValue
			}
		},
		methods: {
			onChange() {
				if (!this.disabled) {
					if (!this.stopChange) {
						this.checked = !this.checked
						this.$emit("input", this.checked);
						this.$emit('update:modelValue', this.checked);
						this.$emit('change', this.checked)
					} else {

						this.$emit('change', this.checked)
					}
				}
			},
		},
	};
</script>
<style lang="scss" scoped>
	view {
		box-sizing: border-box;
	}

	.zero_switch_disabled {
		opacity: 0.7;
	}

	.zero_switch {
		width: 54px;
		height: 30px;
		border-radius: 26px;
		overflow: hidden;
		border: 1px solid #000000;
		position: relative;
		transition: all 0.3s;

		.text {
			line-height: 28px;
			padding: 0 7px;

			.text_on {
				text-align: left;
				overflow: hidden;
				white-space: nowrap;

			}

			.text_off {
				text-align: right;
				overflow: hidden;
				white-space: nowrap;
				margin-left: auto;
			}
		}

		.dot {
			position: absolute;
			border-radius: 100%;
			transition: all 0.3s;
			width: 24px;
			height: 24px;
			background: #fff;
			left: 2px;
			top: 2px;
			// box-shadow: 0rpx 0rpx 1px 1px rgba(0, 0, 0, 0.2);

		}

		.dot_act {
			transform: translate(100%);
		}

		.moon {
			background: transparent !important;
			box-shadow: inset 8px -4px 0px 0px #fff000;
		}

		.moon_act {
			background: #fff000 !important;
			box-shadow: none;
		}
	}
</style>