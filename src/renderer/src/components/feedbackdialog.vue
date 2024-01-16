<template>
    <el-dialog v-model="dialogVisible" :title="$t('Feedback.Title')" width="50%">
        <span>{{ $t('Feedback.Content') }}</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="success" @click="openUrl('https://github.com/funny-cat-happy/DarkestDungeonToolbox')">{{
                    $t('Feedback.GoToGithub')
                }}</el-button>
                <el-button type="success" @click="openUrl('https://gitee.com/funny-cat-happy/DarkestDungeonToolbox')">{{
                    $t('Feedback.GoToGitee')
                }}</el-button>
                <el-button @click="dialogVisible = false">{{ $t('Feedback.close') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const openUrl = (url: string) => {
    window.util.openUrl(url)
}
const dialogVisible = ref(false)
const openDialog = () => {
    dialogVisible.value = true
}
defineExpose({
    openDialog
})
</script>
                                                                   