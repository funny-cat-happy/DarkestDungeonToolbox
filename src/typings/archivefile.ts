export type archiveResType = {
  error: string | null
  config: ConfigType | null
}

type ArchiveSlotType = {
  ArchiveId: string
  ArchiveName: string
  CreateTime: string
  ArchivePath: string
}

export type ConfigType = {
  Base: {
    GameId: string
    ArchivePath: string
    language: string
  }
  ArchiveSlot: ArchiveSlotType[]
}

export type ArchiveCardInfoType = {
  ArchiveSlot: ArchiveSlotType
  ShowArchiveText: boolean
  ArchiveCardClicked: boolean
}

export type TravelInfoType = {
  FilePath: string
  CreateTime: number
}

export type travelResType = {
  error: string | null
  travelInfo: TravelInfoType[]
}

export type TravelCardInfoType = {
  TravelInfo: TravelInfoType
  TravelCardClicked: boolean
}

export type CheckPointInfoType = {
  FilePath: string
  CreateTime: string
  checkPointType: string
}

export type checkPointResType = {
  error: string | null
  checkPointInfo: CheckPointInfoType[]
}

export type CheckPointCardInfoType = {
  CheckPointInfo: CheckPointInfoType
  CheckPointCardClicked: boolean
}

export type ClickedInfoType = {
  archivePath: string
  travelPath: string
  checkPointPath: string
}

export type UnlockContentType = {
  skill: boolean
  story: boolean
  other: boolean
}

interface archiveApiType {
  getArchive: () => Promise<archiveResType>
  archiveRename: (id: string, newName: string) => string
  reloadArchive: () => Promise<archiveResType>
  getTravel: (archivePath: string) => Promise<travelResType>
  getCheckPoint: (travelInfo: TravelInfoType) => Promise<checkPointResType>
  copyArchive: (archivePath: string) => Promise<archiveResType>
  deleteArchive: (archivePath: string) => Promise<archiveResType>
  changeArchive: (clickedInfo: ClickedInfoType) => Promise<archiveResType>
  unlockContent: (unlockContent: UnlockContentType) => Promise<string>
  recoverArchive: () => Promise<string>
}

declare global {
  interface Window {
    archive: archiveApiType
  }
}
