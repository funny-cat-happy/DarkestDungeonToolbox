<template>
    <div id="container">
        <el-container>
            <el-header height="44px">
                <MenuBar :options="menuData" />
            </el-header>
            <el-container>
                <el-aside width="25%">
                    <div class="text-center mb-4px">
                        <el-tooltip effect="light" :content="$t('UI.ArchiveColumnTooltip')" placement="bottom">
                            <el-text size="large">{{ $t('UI.ArchiveColumn') }}</el-text>
                        </el-tooltip>
                    </div>
                    <template v-if="archiveCardInfo && archiveCardInfo.length > 0">
                        <el-card v-for="(val, index) in archiveCardInfo" :key="index" shadow="hover"
                            :class="{ 'bg-slate-200': val.ArchiveCardClicked }"
                            @click="getTravelInfo(val.ArchiveSlot.ArchivePath, val.ArchiveSlot.ArchiveId)"
                            @contextmenu="archiveMenu($event, val.ArchiveSlot.ArchiveId)">
                            <el-row>
                                <el-col :span="8">
                                    <el-text v-if="val.ShowArchiveText" size="large">{{
                                        val.ArchiveSlot.ArchiveName
                                    }}</el-text>
                                    <el-input v-else v-model="val.ArchiveSlot.ArchiveName" class="h-25px"
                                        @blur="archiveRename(val.ArchiveSlot.ArchiveId, val.ArchiveSlot.ArchiveName)"
                                        @keyup.enter="archiveRename(val.ArchiveSlot.ArchiveId, val.ArchiveSlot.ArchiveName)" />

                                </el-col>
                                <el-col :span="8"><el-button :icon="Edit" size="small" circle
                                        @click="showArchiveInput(val.ArchiveSlot.ArchiveId)" /></el-col>
                            </el-row>
                            <!-- <el-row>
                                <el-col :span="24"><el-text size="small">{{ $t('UI.RecordProgress')
                                }}:92%</el-text></el-col>
                            </el-row> -->
                            <el-row>
                                <el-col :span="24"><el-text size="small">{{ $t('UI.SyncTime') }}:{{
                                    val.ArchiveSlot.CreateTime
                                }}</el-text></el-col>

                            </el-row>
                        </el-card>
                    </template>
                    <div v-else class="text-center mt-10px">
                        <el-button type="primary" size="large" @click="getArchive">{{ $t('UI.InitArchive') }}</el-button>
                    </div>
                </el-aside>
                <el-aside width="20%">
                    <div class="text-center">
                        <el-tooltip effect="light" :content="$t('UI.TravelColumnTooltip')" placement="bottom">
                            <el-text size="large">{{ $t('UI.TravelColumn') }}</el-text>
                        </el-tooltip>
                    </div>
                    <div class="mt-4px">
                        <el-scrollbar height="720px">
                            <el-card v-for="(val, index) in travelInfoFormatted" :key="index" shadow="hover"
                                :class="{ 'bg-slate-200': val.TravelCardClicked }"
                                @click="getCheckPointInfo(val.TravelInfo, index)">
                                <el-row>
                                    <el-col :span="24"><el-text size="large">{{ $t('UI.TravelRecond') }}{{ index + 1
                                    }}</el-text></el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="24"><el-text size="small">{{ $t('UI.CreateTime') }}:{{ val.createDate
                                    }}</el-text></el-col>
                                </el-row>
                            </el-card>
                        </el-scrollbar>
                    </div>
                </el-aside>
                <el-aside width="20%">
                    <div class="text-center">
                        <el-tooltip effect="light" class="box-item" :content="$t('UI.CheckPointTooltip')"
                            placement="bottom">
                            <el-text size="large">{{ $t('UI.CheckPointColumn') }}</el-text>
                        </el-tooltip>
                    </div>
                    <div class="mt-4px">
                        <el-card v-for="(val, index) in checkPointInfoFormatted" :key="index" shadow="hover"
                            :class="{ 'bg-slate-200': val.CheckPointCardClicked }" @click="checkPointCardClick(index)">
                            <el-row>
                                <el-col :span="24"><el-text size="large">{{ $t('UI.CheckPointRecond') }}{{ index + 1
                                }}</el-text></el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="24"><el-text size="small">{{ $t('UI.CheckPointTime') }}:{{ val.createDate
                                }}</el-text></el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="24"><el-text size="small">{{ $t('UI.CheckPointType') }}:{{
                                    val.CheckPointInfo.checkPointType
                                }}</el-text></el-col>
                            </el-row>
                        </el-card>
                    </div>
                </el-aside>
                <el-main>
                    <el-form :model="formInfo">
                        <el-row>
                            <el-form-item :label="$t('UI.UnlockSkill')">
                                <el-switch v-model="formInfo.skill" />
                            </el-form-item>
                        </el-row>
                        <el-row>
                            <el-form-item :label="$t('UI.UnlockStory')">
                                <el-switch v-model="formInfo.story" />
                            </el-form-item>
                        </el-row>
                        <el-row>
                            <el-form-item :label="$t('UI.UnlockOther')">
                                <el-switch v-model="formInfo.other" />
                            </el-form-item>
                        </el-row>
                        <el-row class="justify-center">
                            <el-col :span="18">
                                <el-form-item>
                                    <el-button type="primary" @click="changeArchive">{{ $t('UI.ChangeArchive')
                                    }}</el-button>
                                    <el-button type="success" @click="unlockContent">{{ $t('UI.UnlockContent')
                                    }}</el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-main>
            </el-container>
        </el-container>
        <feedbackDialog ref="feedbackDialogRef" />
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed, toRaw, Ref, watch } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { MenuBar } from '@imengyu/vue3-context-menu'
import { ElMessage } from 'element-plus'
import i18n from '@renderer/i18n';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@imengyu/vue3-context-menu'
import type { ArchiveCardInfoType, TravelInfoType, TravelCardInfoType, CheckPointCardInfoType, UnlockContentType } from '@type/archivefile'
import type { SupportedLanguageType } from '@type/language'
import { MenuBarOptions } from '@imengyu/vue3-context-menu/lib/MenuBar'
import feedbackDialog from '@renderer/components/feedbackdialog.vue'

const { t, locale } = useI18n();
const feedbackDialogRef = ref<typeof feedbackDialog>()
//top menu
const menuData = ref<MenuBarOptions>({
    items: [
        {
            label: t('menu.File'),
            children: [
                {
                    label: t('menu.GetArchive'),
                    onClick: () => {
                        getArchive()
                    }
                },
                {
                    label: t('menu.ReloadArchive'),
                    onClick: () => {
                        reloadArchive()
                    }
                },
                {
                    label: t('menu.RecoverArchive'),
                    onClick: async () => {
                        const res = await window.archive.recoverArchive()
                        if (res !== '') {
                            ElMessage({ message: res, type: 'error' })
                        }
                        else {
                            ElMessage({ message: t('menu.RecoverSuccess'), type: 'success' })
                        }
                    }
                }
            ]
        },
        {
            label: t('menu.Setting'),
            children: [
                {
                    label: t('menu.Language'),
                    children: []
                },
            ]
        },
        {
            label: t('menu.Help'),
            children: [
                { label: t('menu.Issue'), onClick: () => { feedbackDialogRef.value?.openDialog() } },
            ]
        },
    ],
    zIndex: 3,
}) as Ref<MenuBarOptions>
//Game Archive
let clickedInfo = {
    archivePath: '',
    travelPath: '',
    checkPointPath: ''
}
const archiveCardInfo = ref<ArchiveCardInfoType[]>()
const gameId = ref<string>()
const getArchive = async () => {
    const res = await window.archive.getArchive()
    if (res.error) {
        ElMessage({ message: res.error, type: 'error' })
    }
    else {
        gameId.value = res.config?.Base.GameId
        archiveCardInfo.value = []
        res.config!.ArchiveSlot.forEach((item) => {
            archiveCardInfo.value?.push({ ArchiveSlot: { ...item }, ShowArchiveText: true, ArchiveCardClicked: false })
        })
    }
}
const copyArchive = async (id: string) => {
    const path = archiveCardInfo.value!.find((item) => item.ArchiveSlot.ArchiveId === id)?.ArchiveSlot.ArchivePath
    if (path === undefined) {
        ElMessage({ message: t('archive.NotFoundArchive'), type: 'error' })
        return
    }
    const res = await window.archive.copyArchive(path)
    if (res.error) {
        ElMessage({ message: res.error, type: 'error' })
    }
    else {
        refreshAllColumn()
        gameId.value = res.config?.Base.GameId
        res.config!.ArchiveSlot.forEach((item) => {
            archiveCardInfo.value?.push({ ArchiveSlot: { ...item }, ShowArchiveText: true, ArchiveCardClicked: false })
        })
    }
}

const archiveRename = (id: string, newName: string) => {
    if (newName === '') {
        ElMessage({ message: t('archive.ArchiveNameNotEmpty'), type: 'error' })
        return
    }
    archiveCardInfo.value!.find((item) => item.ArchiveSlot.ArchiveId === id)!.ShowArchiveText = true
    const res = window.archive.archiveRename(id, newName)
    if (res !== '') {
        ElMessage({ message: res, type: 'error' })
    }
}
const showArchiveInput = (id: string) => {
    archiveCardInfo.value!.find((item) => item.ArchiveSlot.ArchiveId === id)!.ShowArchiveText = false
}

const reloadArchive = async () => {
    const res = await window.archive.reloadArchive()
    if (res.error) {
        ElMessage({ message: res.error, type: 'error' })
    }
    else {
        if (res.config && res.config !== null) {
            locale.value = res.config!.Base.language as string
            window.language.switchLanguage(res.config!.Base.language)
        }
        gameId.value = res.config?.Base.GameId
        archiveCardInfo.value = []
        if (res.config) {
            res.config.ArchiveSlot.forEach((item) => {
                archiveCardInfo.value?.push({ ArchiveSlot: { ...item }, ShowArchiveText: true, ArchiveCardClicked: false })
            })
        }
    }
}

const deleteArchive = async (id: string) => {
    const path = archiveCardInfo.value!.find((item) => item.ArchiveSlot.ArchiveId === id)?.ArchiveSlot.ArchivePath
    if (path === undefined) {
        ElMessage({ message: t('archive.NotFoundArchive'), type: 'error' })
        return
    }
    const res = await window.archive.deleteArchive(path)
    if (res.error) {
        ElMessage({ message: res.error, type: 'error' })
    }
    else {
        refreshAllColumn()
        gameId.value = res.config?.Base.GameId
        res.config!.ArchiveSlot.forEach((item) => {
            archiveCardInfo.value?.push({ ArchiveSlot: { ...item }, ShowArchiveText: true, ArchiveCardClicked: false })
        })
    }
}

const archiveMenu = (e: MouseEvent, id: string) => {
    ContextMenu.showContextMenu({
        x: e.x,
        y: e.y,
        items: [
            {
                label: t('menu.CopyArchive'),
                onClick: () => {
                    copyArchive(id)
                }
            },
            {
                label: t('menu.DeleteArchive'),
                onClick: () => {
                    deleteArchive(id)
                }
            },
        ]
    })
}

//Game Travel
const travelCardInfo = ref<TravelCardInfoType[]>([])
const getTravelInfo = async (archivePath: string, id: string) => {
    const res = await window.archive.getTravel(archivePath)
    if (res.error) {
        ElMessage({ message: res.error, type: 'error' })
    }
    else {
        archiveCardInfo.value!.forEach((item) => {
            item.ArchiveCardClicked = false
        })
        const archiveCard = archiveCardInfo.value!.find((item) => item.ArchiveSlot.ArchiveId === id)
        archiveCard!.ArchiveCardClicked = true
        clickedInfo.archivePath = archivePath
        travelCardInfo.value = []
        checkPointInfo.value = []
        res.travelInfo.forEach((item) => {
            travelCardInfo.value?.push({ TravelInfo: item, TravelCardClicked: false })
        })
    }
}

const travelInfoFormatted = computed(() => {
    return travelCardInfo.value?.map((item) => {
        const localDateString = new Date(item.TravelInfo.CreateTime).toLocaleString();
        return { ...item, createDate: localDateString };
    })
})

//Game CheckPoint
const checkPointInfo = ref<CheckPointCardInfoType[]>([])
const getCheckPointInfo = async (travelInfo: TravelInfoType, index: number) => {
    const res = await window.archive.getCheckPoint(toRaw(travelInfo))
    if (res.error) {
        ElMessage({ message: res.error, type: 'error' })
    }
    else {
        clickedInfo.travelPath = travelInfo.FilePath
        checkPointInfo.value = []
        res.checkPointInfo.forEach((item) => {
            checkPointInfo.value?.push({ CheckPointInfo: item, CheckPointCardClicked: false })
        })
        travelCardInfo.value?.forEach((item) => {
            item.TravelCardClicked = false
        })
        travelCardInfo.value![index].TravelCardClicked = true
    }
}
const checkPointInfoFormatted = computed(() => {
    return checkPointInfo.value?.map((item) => {
        const localDateString = new Date(item.CheckPointInfo.CreateTime).toLocaleString();
        return { ...item, createDate: localDateString };
    })
})
const checkPointCardClick = (index: number) => {
    checkPointInfo.value!.forEach((item) => {
        item.CheckPointCardClicked = false
    })
    checkPointInfo.value![index].CheckPointCardClicked = true
    clickedInfo.checkPointPath = checkPointInfo.value![index].CheckPointInfo.FilePath
}
const refreshAllColumn = () => {
    clickedInfo = {
        archivePath: '',
        travelPath: '',
        checkPointPath: ''
    }
    archiveCardInfo.value = []
    travelCardInfo.value = []
    checkPointInfo.value = []
}
const changeArchive = async () => {
    if (clickedInfo.checkPointPath === '') {
        ElMessage({ message: t('archive.ChooseCheckPoint'), type: 'error' })
        return
    }
    const res = await window.archive.changeArchive(clickedInfo)
    if (res.error) {
        ElMessage({ message: res.error, type: 'error' })
    }
    else {
        ElMessage({ message: t('archive.ChangeArchiveSuccess'), type: 'success' })
    }
}
//unlock content
const formInfo = ref<UnlockContentType>({
    skill: false,
    story: false,
    other: false
})
const unlockContent = async () => {
    const res = await window.archive.unlockContent(toRaw(formInfo.value))
    if (res !== '') {
        ElMessage({ message: res, type: 'error' })
    }
    else {
        ElMessage({ message: t('archive.UnlockSuccess'), type: 'success' })
    }
}
//language
const loadSupportedLanguage = () => {
    const languageList: Array<SupportedLanguageType> = i18n.getSupportedLanguages()
    const settingMenu = menuData.value.items!.find((item) => item.label === t('menu.Setting'))
    const languageMenu = settingMenu!.children!.find((item) => item.label === t('menu.Language'))
    if (languageMenu) {
        languageMenu.children = []
        languageList.forEach((item) => {
            languageMenu.children!.push({ label: item.label, onClick: () => { locale.value = item.name, window.language.switchLanguage(item.name) } })
            console.log(item)
        })
    }
}
watch(locale, () => {
    menuData.value = {
        items: [
            {
                label: t('menu.File'),
                children: [
                    {
                        label: t('menu.GetArchive'),
                        onClick: () => {
                            getArchive()
                        }
                    },
                    {
                        label: t('menu.ReloadArchive'),
                        onClick: () => {
                            reloadArchive()
                        }
                    },
                    {
                        label: t('menu.RecoverArchive'),
                        onClick: async () => {
                            const res = await window.archive.recoverArchive()
                            if (res !== '') {
                                ElMessage({ message: res, type: 'error' })
                            }
                            else {
                                ElMessage({ message: t('menu.RecoverSuccess'), type: 'success' })
                            }
                        }
                    }
                ]
            },
            {
                label: t('menu.Setting'),
                children: [
                    {
                        label: t('menu.Language'),
                        children: []
                    },
                ]
            },
            {
                label: t('menu.Help'),
                children: [
                    { label: t('menu.Issue'), onClick: () => { feedbackDialogRef.value?.openDialog() } },
                ]
            },
        ],
        zIndex: 3,
    }
    loadSupportedLanguage()
})
onMounted(async () => {
    await reloadArchive()
    loadSupportedLanguage()
})
</script>
<style></style>