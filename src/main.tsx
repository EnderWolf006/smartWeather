//@ts-nocheck
import { bitable, UIBuilder, FieldType } from "@lark-base-open/js-sdk";
import axios from 'axios';
import { UI } from "blockly/core/events/ulimitDayls.js";
import resources from './i18n/resources';
export default async function main(uiBuilder: UIBuilder, { t }) {
    //生成页面布局
    uiBuilder.form((form) => ({

        formItems: [

            form.select('select', {
                label: t('ServiceType'), options: [
                    { label: t('BuiltInFreeVersion'), value: 'hfn' },
                    { label: t('CustomFreeVersion'), value: 'hff' },
                    { label: t('CustomPaidVersion'), value: 'hfv' },
                    { label: t('XinBuiltInFreeVersion'), value: 'xfn' },
                    { label: t('XinFreeVersion'), value: 'xff' },
                    { label: t('XinPaidVersion'), value: 'xfv' }
                ], defaultValue: localStorage.getItem('select') ?? 'hfn',
            }),
            form.input('key', { label: t('AppKey'), defaultValue: localStorage.getItem('key') ?? null }),
            form.select('resultType', {
                label: t('ResultType'), options: [
                    { label: '天气', value: 'weather' },
                    { label: '气象预警', value: 'warning' },
                    { label: '天气(emoji)', value: 'weatherEmoji' },
                    { label: '天气+气象预警', value: 'weatherAndWarning' },
                    { label: '天气(emoji)+气象预警', value: 'weatherEmojiAndWarning' },
                ], defaultValue: localStorage.getItem('resultType') ?? 'weatherAndWarning',
            }),
            form.tableSelect('table', { label: t('ChooseTable'), value: localStorage.getItem('table') ?? null }),
            form.fieldSelect('province', { label: t('InputProvince'), sourceTable: 'table', filterByTypes: [FieldType.Location], defaultValue: localStorage.getItem('province') ?? null }),
            form.fieldSelect('date', { label: t('InputDate'), sourceTable: 'table', filterByTypes: [FieldType.DateTime], defaultValue: localStorage.getItem('date') ?? null }),
            form.fieldSelect('field', { label: t('ChooseField'), sourceTable: 'table', filterByTypes: [FieldType.Text], defaultValue: localStorage.getItem('field') ?? null }),
            form.fieldSelect('warning', { label: t('WarningField'), sourceTable: 'table', filterByTypes: [FieldType.Text], defaultValue: localStorage.getItem('warning') ?? null }),
        ],
        buttons: [t('GetWeather'), t('HelpDoc')],
    }), async ({ key, values }) => {
        if (key == t('HelpDoc')) {
            window.open("https://wingahead.feishu.cn/wiki/N8CFweRz7i3yBlkHK6Vc4WTanQd");
        } else {
            localStorage.setItem('select', values.select);
            localStorage.setItem('key', values.key);
            localStorage.setItem('date', values.date.id);
            localStorage.setItem('table', values.table.id);
            localStorage.setItem('field', values.field.id);
            localStorage.setItem('province', values.province.id);
            localStorage.setItem('warning', values.warning.id);
            localStorage.setItem('resultType', values.resultType);
            console.log(values.warning);
            if (values.table == null || values.select == null || values.province == null || values.date == null) {
                uiBuilder.message.error(t('NoData'), 5)
            } else {
                //展示加载页面
                uiBuilder.showLoading(t('Loading'));
                const recordList = await table.getRecordList();
                for (const record of recordList) {
                    //计算日期差值
                    var provincecellValue = await values.province.getValue(record);
                    var datecellValue = JSON.stringify(await values.date.getValue(record));
                    if (JSON.stringify(provincecellValue) != "null" && JSON.stringify(datecellValue) != "null") {
                        if (values.select == "hfn" || values.select == "hff") {
                            var limitDay = 7;
                        } else if (values.select == "hfv" || values.select == "xfv") {
                            var limitDay = 14
                        } else if (values.select == "xff" || values.select == "xfn") {
                            var limitDay = 3
                        }
                        //判断日期差值
                        var todayStartlimitDaymestamp = new Date().setHours(0, 0, 0, 0);
                        var diffMilliseconds = datecellValue - todayStartlimitDaymestamp;
                        var diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));
                        if (diffDays < 0 || diffDays > limitDay) {
                            await values.field.setValue(record, t('DateOutOfRange'));
                        } else {
                            const [longitude, lalimitDaytude] = provincecellValue["location"].split(',');
                            const lat = parseFloat(lalimitDaytude);
                            const lon = parseFloat(longitude);
                            //遍历所有记录
                            if (values.select == "hfn") {
                                var serviceContent = 1
                                var tokenKey = "a009a7e44f234f4fa221403f16b68842";
                                var serviceVersion = "devapi";
                            } else if (values.select == "hff") {
                                var serviceContent = 1
                                var tokenKey = values.key;
                                var serviceVersion = "devapi";
                            } else if (values.select == "hfv") {
                                var serviceContent = 1
                                var tokenKey = values.key;
                                var serviceVersion = "api";
                            } else if (values.select == "xff") {
                                var serviceContent = 2
                                var tokenKey = values.key;
                            } else if (values.select == "xfn") {
                                var serviceContent = 2
                                var tokenKey = "SL6KRXb8GvZ-_-5Cb";
                            }
                            else if (values.select == "xfv") {
                                var serviceContent = 2
                                var tokenKey = values.key;
                            }
                            if (serviceContent == 1) {
                                var provincecellValue = await values.province.getValue(record);
                                if (values.resultType == 'weather' || values.resultType == 'weatherEmoji' || values.resultType == 'weatherAndWarning' || values.resultType == 'weatherEmojiAndWarning') {
                                    //发送请求
                                    axios.get('https://' + serviceVersion + '.qweather.com/v7/weather/7d?location=' + provincecellValue["location"] + '&key=' + tokenKey).then(response => {
                                        //判断返回状态码
                                        if (response.data["code"] == 400) {
                                            uiBuilder.message.error(t('InvalidRequest'), 5)
                                            return;
                                        }
                                        else if (response.data["code"] == 401) {
                                            uiBuilder.message.error(t('InvalidKey'), 5)
                                            return;
                                        }
                                        else if (response.data["code"] == 402 || response.data["code"] == 429) {
                                            uiBuilder.message.error(t('ExceedLimit'), 5)
                                            return;
                                        }
                                        else if (response.data["code"] == 404) {
                                            uiBuilder.message.error(t('NoData'), 5)
                                            return;
                                        }
                                        else {
                                            //修改天气内容
                                            if (values.resultType == 'weatherEmoji' || values.resultType == 'weatherEmojiAndWarning') {
                                                values.field.setValue(record, resources.icons_hf[response.data["daily"][diffDays]["iconDay"]] + '/' + resources.icons_hf[response.data["daily"][diffDays]["iconNight"]]);
                                            } else {
                                                values.field.setValue(record, response.data["daily"][diffDays]["textDay"] + '/' + response.data["daily"][diffDays]["textNight"]);
                                            }
                                        }
                                    })
                                }
                                if (values.resultType == 'warning' || values.resultType == 'weatherAndWarning' || values.resultType == 'weatherEmojiAndWarning') {
                                    axios.get('https://' + serviceVersion + '.qweather.com/v7/warning/now?location=' + provincecellValue["location"] + '&key=' + tokenKey).then(response => {
                                        //判断返回状态码
                                        if (response.data["code"] == 400) {
                                            uiBuilder.message.error(t('InvalidRequest'), 5)
                                            return;
                                        }
                                        else if (response.data["code"] == 401) {
                                            uiBuilder.message.error(t('InvalidKey'), 5)
                                            return;
                                        }
                                        else if (response.data["code"] == 402 || response.data["code"] == 429) {
                                            uiBuilder.message.error(t('ExceedLimit'), 5)
                                            return;
                                        }
                                        else if (response.data["code"] == 404) {
                                            uiBuilder.message.error(t('NoData'), 5)
                                            return;
                                        } else if (diffDays !== 0) {
                                            values.warning.setValue(record, 'NULL');
                                        }
                                        else {
                                            if (response.data && Array.isArray(response.data.warning) && response.data.warning.length > 0) {
                                                values.warning.setValue(record, response.data.warning[0].title);
                                            } else {
                                                values.warning.setValue(record, '无预警');
                                            }
                                        }

                                    })
                                }
                            } else if (serviceContent == 2) {
                                if (values.resultType == 'weather' || values.resultType == 'weatherEmoji' || values.resultType == 'weatherAndWarning' || values.resultType == 'weatherEmojiAndWarning') {
                                    axios.get('https://api.seniverse.com/v3/weather/daily.json?key=' + tokenKey + '&location=' + lat + ':' + lon).then(response => {
                                        //修改天气内容
                                        if (values.resultType == 'weatherEmoji' || values.resultType == 'weatherEmojiAndWarning') {
                                            values.field.setValue(record, resources.icons_xz[response.data["results"][0]["daily"][diffDays]["code_day"]] + '/' + resources.icons_xz[response.data["results"][0]["daily"][diffDays]["code_night"]]);
                                        } else {
                                            values.field.setValue(record, response.data["results"][0]["daily"][diffDays]["text_day"] + '/' +response.data["results"][0]["daily"][diffDays]["text_night"]);
                                        }
                                    }).catch(function (error) {
                                        if (error.response.status == 403) {
                                            uiBuilder.message.error(t('InvalidRequest'), 5)
                                            return;
                                        }
                                        else if (error.response.status == 404) {
                                            uiBuilder.message.error(t('NoData'), 5)
                                            return;
                                        }
                                    });
                                }
                                if (values.resultType == 'warning' || values.resultType == 'weatherAndWarning' || values.resultType == 'weatherEmojiAndWarning') {
                                    axios.get('https://api.seniverse.com/v3/weather/alarm.json?key=' + tokenKey + '&location=' + lat + ':' + lon).then(response => {
                                        //修改天气内容
                                        if (response.data && Array.isArray(response.results[0].alarms) && response.results[0].alarms > 0) {
                                            values.warning.setValue(record, response.results[0].alarms[0].title);
                                        } else {
                                            values.warning.setValue(record, '无预警');
                                        }
                                    }).catch(function (error) {
                                        if (error.response.status == 403) {
                                            uiBuilder.message.error(t('InvalidRequest'), 5)
                                            return;
                                        }
                                        else if (error.response.status == 404) {
                                            uiBuilder.message.error(t('NoData'), 5)
                                            return;
                                        }
                                    });
                                }
                            }
                        }
                    }
                    await uiBuilder.hideLoading();
                }
            }
        }
    });
    //发生改变时刷新
    bitable.base.onTableAdd((event) => {
        uiBuilder.reload()
    })
    bitable.base.onTableDelete((event) => {
        uiBuilder.reload()
    })
    var table = await bitable.base.getActiveTable();
    // bitable.base.onSelectionChange(async () => {
    //     uiBuilder.reload()
    // })
    table.onFieldModify((event) => {
        uiBuilder.reload()
    })
    table.onFieldAdd((event) => {
        uiBuilder.reload()
    })
    table.onFieldDelete((event) => {
        uiBuilder.reload()
    })
    //记录暂不需要刷新
    /*
    table.onRecordAdd((event) => {
        uiBuilder.reload()
    })
    table.onRecordDelete((event) => {
        uiBuilder.reload()
    })
    table.onRecordModify((event) => {
        uiBuilder.reload()
    })
    */
}