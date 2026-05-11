type settingType = {
    value: number;
    def: number;
    minValue: number;
    maxValue: number;
    offset: number;
    factor: number;
    addition: number;
    unit: string;
};

type settingOptionType = {
    value: number;
    def: number;
    numOptions: number;
    options: string;
};

type MselectOneType = {
    values: number;
    def: number;
    numOptions: number;
    numItems: number;
    options: string;
    itemLabels: string;
};

type subMenuGraphicType = {
    submenu: string;
};

type dataType = {
    MselectOne?: MselectOneType;
    settingOption?: settingOptionType;
    setting?: settingType;
    subMenuGraphic?: subMenuGraphicType;
    submenu: string;
};

type MenuItemType = {
    label: string;
    type: number;
    data: dataType;
};

export type currentMenuType = {
    type: number;
    title: string;
    items: MenuItemType[];
    itemCount: number;
};
