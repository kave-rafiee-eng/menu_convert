import menuDataJson from "./MenuDataJson.json" with { type: "json" };
import { oldMenuTypes } from "./oldmenudef.ts";
import type { currentMenuType } from "./oldmenutypes.ts";

//--------------------- new Menu Types
enum typeMenuEnum {
    UNDEFINDED = "UNDEFINDED",
    SUBMENU = "SUBMENU",
    SETTING_ON_PARAMETER = "SETTING_ON_PARAMETER",
    SETTING_ON_SELECT = "SETTING_ON_SELECT",
    SETTING_MULTY_SELECT = "SETTING_MULTY_SELECT",
    SETTING_MULTY_GROUP = "SETTING_MULTY_GROUP",
}
//

type DescriptionType = Record<
    "english" | "persian" | "arabic" | "turkish" | "russian" | "german",
    string
>;

type MiniDescriptionType = Record<"english" | "persian", string>;

type optionType = {
    value: string;
    description: MiniDescriptionType;
};

type settingOneParameterType = {
    address: number;
    addition: number;
    unit: string;
    factor: number;
    minValue: number;
    maxValue: number;
    label: string;
    description: DescriptionType;
};

type settingOneSelectType = {
    address: number;
    options: optionType[];
    label: string;
    description: DescriptionType;
};

type settingMultySelectType = {
    addresses: number[];
    options: optionType[];
    itemLabels: optionType[];
    description: DescriptionType;
};

type settingMultyGroupType = {
    settingOneParameter?: settingOneParameterType;
    settingOneSelect?: settingOneSelectType;
};

type menuDataType = {
    settingOneParameter?: settingOneParameterType;
    settingOneSelect?: settingOneSelectType;
    settingMultySelect?: settingMultySelectType;
    settingMultyGroup?: settingMultyGroupType[];
};

type ParanetIdLableType = {
    id: string;
    label: string;
};

type menuType = {
    id: string;
    parentId: ParanetIdLableType[];
    lable: string | undefined;
    type: typeMenuEnum;
    data: menuDataType;
    description: DescriptionType;
};

//------------------------------------------

let keys = Object.keys(menuDataJson);

let listKeys = keys.filter((id) => id.includes("ListId"));
let menuKeys = keys.filter((id) => {
    if (id.includes("MenuId") || id.includes("mainMenu")) {
        return true;
    }
});

type oldMenuType = {
    menu: currentMenuType;
    id: string;
};

let oldMenus: oldMenuType[] = menuKeys.map((key) => {
    return {
        menu: menuDataJson[key as keyof typeof menuDataJson] as currentMenuType,
        id: key,
    };
});

type oldListType = {
    list: string[];
    id: string;
};
let oldLists: oldListType[] = listKeys.map((key) => {
    return {
        list: menuDataJson[key as keyof typeof menuDataJson] as string[],
        id: key,
    };
});

oldMenus = oldMenus.filter((menu) => {
    const oldMenu = menu.menu;
    if (
        oldMenu.type == oldMenuTypes.MENU_TYPE_SUBMENU ||
        oldMenu.type == oldMenuTypes.MENU_TYPE_SUBMENU_GRAPHC ||
        oldMenu.type == oldMenuTypes.MENU_TYPE_SETTING_ON_PARAMETER ||
        oldMenu.type == oldMenuTypes.MENU_TYPE_SETTING_ON_SELECT ||
        oldMenu.type == oldMenuTypes.MENU_TYPE_SETTING_MULTY_GROUP ||
        oldMenu.type == oldMenuTypes.MENU_TYPE_SETTING_MULTY_SELECT_ONE_STAGE
    )
        return true;
});

//------------------------------
type tableIdType = {
    newId: string;
    oldId: string;
};

const tableId: tableIdType[] = oldMenus.map((menu, index) => {
    const newId = index.toString();
    const oldId = menu.id;
    return { newId, oldId };
});

//--------------------------------------------------------
let newMenus: menuType[] = tableId.map((table) => {
    const oldMenu = oldMenus.find((m) => m.id == table.oldId);

    if (!oldMenu?.menu) {
        throw new Error("Menu not found");
    }

    return {
        parentId: findParent(table.oldId),
        id: table.newId,
        lable: oldMenu.menu.title,
        type: chaneType(oldMenu.menu),
        data: changeData(oldMenu.menu),
        description: {
            english: "",
            persian: "",
            german: "",
            russian: "",
            turkish: "",
            arabic: "",
        },
    };
});

function createEmptyDescription(): DescriptionType {
    return {
        english: "",
        persian: "",
        german: "",
        russian: "",
        turkish: "",
        arabic: "",
    };
}

function createEmptyMiniDescription(): MiniDescriptionType {
    return {
        english: "",
        persian: "",
    };
}

function changeData(menu: currentMenuType): menuDataType {
    if (menu.type === oldMenuTypes.MENU_TYPE_SETTING_MULTY_GROUP) {
        let extract: settingMultyGroupType[] = [];

        for (const item of menu.items) {
            //----------Select
            if (item.data?.settingOption) {
                const settingOption = item.data.settingOption;
                let itemSelect: settingOneSelectType = {
                    label: item.label,
                    address: settingOption.value,
                    options: findList(settingOption.options),
                    description: createEmptyDescription(),
                };
                extract.push({ settingOneSelect: itemSelect });
            } else if (item.data?.setting) {
                const setting = item.data.setting;
                let itemNumber: settingOneParameterType = {
                    label: item.label,
                    address: setting.value,
                    addition: setting.addition,
                    unit: setting.unit,
                    factor: setting.factor,
                    minValue: setting.minValue,
                    maxValue: setting.maxValue,
                    description: createEmptyDescription(),
                };
                extract.push({ settingOneParameter: itemNumber });
            }
        }
        return {
            settingMultyGroup: extract,
        };
    } else if (
        menu.type === oldMenuTypes.MENU_TYPE_SETTING_MULTY_SELECT_ONE_STAGE
    ) {
        for (const item of menu.items) {
            if (item.data?.MselectOne) {
                const MselectOne = item.data.MselectOne;

                let numItems = MselectOne.numItems;
                let startAdd = MselectOne.values;
                let addresses = Array.from({ length: numItems }, (_, index) => {
                    return startAdd + index;
                });

                let options = findList(MselectOne.options);
                let itemLabels = findList(MselectOne.itemLabels);
                return {
                    settingMultySelect: {
                        addresses: (addresses = Array.from(
                            { length: numItems },
                            (_, index) => {
                                return startAdd + index;
                            },
                        )),
                        options,
                        itemLabels,
                        description: createEmptyDescription(),
                    },
                };
            }
        }
    } else if (menu.type === oldMenuTypes.MENU_TYPE_SETTING_ON_SELECT) {
        for (const item of menu.items) {
            if (item.data?.settingOption) {
                const settingOption = item.data.settingOption;

                return {
                    settingOneSelect: {
                        label: item.label,
                        address: settingOption.value,
                        options: findList(settingOption.options),
                        description: createEmptyDescription(),
                    },
                };
            }
        }
    }
    if (menu.type === oldMenuTypes.MENU_TYPE_SETTING_ON_PARAMETER) {
        for (const item of menu.items) {
            if (item.data?.setting) {
                const setting = item.data.setting;
                return {
                    settingOneParameter: {
                        label: item.label,
                        address: setting.value,
                        addition: setting.addition,
                        unit: setting.unit,
                        factor: setting.factor,
                        minValue: setting.minValue,
                        maxValue: setting.maxValue,
                        description: createEmptyDescription(),
                    },
                };
            }
        }
    }

    return {};
}

function findList(id: string): optionType[] {
    let found = oldLists.find((list) => list.id === id);
    if (found != undefined) {
        return found.list.map<optionType>((value) => ({
            value: value,
            description: createEmptyMiniDescription(),
        }));
    } else return [];
}

function chaneType(menu: currentMenuType) {
    if (menu.type == oldMenuTypes.MENU_TYPE_SUBMENU)
        return typeMenuEnum.SUBMENU;
    if (menu.type == oldMenuTypes.MENU_TYPE_SUBMENU_GRAPHC)
        return typeMenuEnum.SUBMENU;
    if (menu.type == oldMenuTypes.MENU_TYPE_SETTING_ON_PARAMETER)
        return typeMenuEnum.SETTING_ON_PARAMETER;
    if (menu.type == oldMenuTypes.MENU_TYPE_SETTING_ON_SELECT)
        return typeMenuEnum.SETTING_ON_SELECT;
    if (menu.type == oldMenuTypes.MENU_TYPE_SETTING_MULTY_GROUP)
        return typeMenuEnum.SETTING_MULTY_GROUP;
    if (menu.type == oldMenuTypes.MENU_TYPE_SETTING_MULTY_SELECT_ONE_STAGE)
        return typeMenuEnum.SETTING_MULTY_SELECT;
    return typeMenuEnum.UNDEFINDED;
}

function findParent(id: string): ParanetIdLableType[] {
    let idsLaels: ParanetIdLableType[] = [];
    oldMenus.forEach((menu) => {
        const oldMenu = menu.menu;

        oldMenu.items.forEach((item) => {
            if (
                item.data.submenu === id ||
                item.data.subMenuGraphic?.submenu == id
            ) {
                const table: tableIdType | undefined = tableId.find((table) => {
                    return table.oldId === menu.id;
                });
                if (table != undefined) {
                    const idLable: ParanetIdLableType = {
                        id: table.newId,
                        label: item.label,
                    };
                    idsLaels.push(idLable);
                }
            }
        });
    });

    return idsLaels;
}

import fs from "fs";

fs.writeFileSync(
    "./src/dist/Menu-tree.json",
    JSON.stringify(newMenus, null, 2),
    "utf-8",
);
console.log("Saved ✅");

import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
});

newMenus.forEach(async (menu) => {
    // if (menu.type == typeMenuEnum.SETTING_MULTY_GROUP) {
    try {
        const res = await api.post("/menu", menu);
        console.log(`save on sql id : ${menu.id}`);
    } catch (err) {
        console.log(err);
    }

    // console.log(menu);
    console.log("------------------------------");
    // }
});

setInterval(() => {
    console.log("bb");
}, 10000);
