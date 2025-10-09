import { Upgrade, UpgradeType } from "../game/types"
import { t } from '../i18n/LanguageManager';

export function getUpgrades() : Upgrade[] {
    return [
        {
            name: t('game.upgrades.batWidth.name'),
            description: t('game.upgrades.batWidth.description'),
            times: 3,
            previewNextUpgrades: 1,
            unlockNextUpgradesAfterTimes: 2,
            type: UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT,
            nextUpgrades: [
                {
                    name: 'Lasers',
                    description: 'Allows the bat to shoot (LMB)',
                    times: 1,
                    previewNextUpgrades: 1,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BAT_ADD_SHOOTER,
                    nextUpgrades: [
                        {
                            name: 'Lasers+',
                            description: 'Increase Laser Damage by 10%',
                            times: 3,
                            previewNextUpgrades: 0,
                            unlockNextUpgradesAfterTimes: 0,
                            nextUpgrades: [],
                            type: UpgradeType.BAT_SHOOTER_INCREASE_10_PERCENT,
                        }
                    ],
                },
                {
                    name: 'Lives',
                    description: 'Increase the number of lives by 1',
                    times: 3,
                    previewNextUpgrades: 1,
                    unlockNextUpgradesAfterTimes: 2,
                    type: UpgradeType.HEALTH_INCREASE_1,
                    nextUpgrades: [
                        {
                            name: 'Slower Ball',
                            description: 'Reduce ball acceleration by 25%',
                            times: 3,
                            previewNextUpgrades: 0,
                            unlockNextUpgradesAfterTimes: 0,
                            type: UpgradeType.BALL_ACCELERATION_REDUCE_25_PERCENT,
                            nextUpgrades: [],
                        }
                    ],
                }
            ],
        },
        {
            name: 'Ball Damage',
            description: 'Increase ball damage by 1',
            times: 3,
            previewNextUpgrades: 1,
            unlockNextUpgradesAfterTimes: 2,
            type: UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1,
            nextUpgrades: [
                {
                    name: 'Piercing',
                    description: 'One in 10 chance to pierce through a brick',
                    times: 1,
                    previewNextUpgrades: 1,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BALL_ADD_PIERCING,
                    nextUpgrades: [
                        {
                            name: "Piercing+",
                            description: 'Increase the chance to pierce by 10%',
                            times: 3,
                            previewNextUpgrades: 1,
                            unlockNextUpgradesAfterTimes: 2,
                            type: UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT,
                            nextUpgrades: [
                                {
                                    name: "Piercing Duration",
                                    description: 'Increase piercing duration by 1 second',
                                    times: 3,
                                    previewNextUpgrades: 0,
                                    unlockNextUpgradesAfterTimes: 0,
                                    type: UpgradeType.BALL_PIERCING_DURATION,
                                    nextUpgrades: [],
                                },
                            ],
                        },
                        
                    ],
                },
                {
                    name: 'Critical Hits',
                    description: 'One in 10 chance to deal double damage',
                    times: 1,
                    previewNextUpgrades: 0,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BALL_ADD_CRITICAL_HITS,
                    nextUpgrades: [
                        {
                            name: "Critical Hits+",
                            description: 'Increase the chance to deal double damage by 10%',
                            times: 3,
                            previewNextUpgrades: 0,
                            unlockNextUpgradesAfterTimes: 0,
                            type: UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT,
                            nextUpgrades: [],
                        }
                    ],
                },
                {
                    name: 'Explosions',
                    description: 'Ball hits now explode, doing splash damage',
                    times: 1,
                    previewNextUpgrades: 0,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BALL_EXPLOSIONS,
                    nextUpgrades: [
                        {
                            name: "Explosions+",
                            description: "Explosions do 10% more damage",
                            times: 3,
                            previewNextUpgrades: 0,
                            unlockNextUpgradesAfterTimes: 1,
                            type: UpgradeType.BALL_EXPLOSIONS,
                            nextUpgrades: []
                        },
                    ]
                },
            ],
        }
    ]
}


