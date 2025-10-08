import { Upgrade, UpgradeType } from "../game/types"

export function getUpgrades() : Upgrade[] {
    return [
        {
            name: 'Bat Width',
            description: 'Increase bat width by 10%',
            times: 3,
            previewNextUpgrades: 1,
            unlockNextUpgradesAfterTimes: 2,
            type: UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT,
            nextUpgrades: [
                {
                    name: 'Bat Shooter',
                    description: 'Allows the bat to shoot (LMB)',
                    times: 1,
                    previewNextUpgrades: 1,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BAT_ADD_SHOOTER,
                    nextUpgrades: [
                        {
                            name: 'Bat Shooter+',
                            description: 'Allows the bat to shoot (LMB)',
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
                    previewNextUpgrades: 0,
                    unlockNextUpgradesAfterTimes: 0,
                    type: UpgradeType.HEALTH_INCREASE_1,
                    nextUpgrades: [],
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
                    previewNextUpgrades: 0,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BALL_ADD_PIERCING,
                    nextUpgrades: [
                        {
                            name: "Piercing+",
                            description: 'Increase the chance to pierce by 10%',
                            times: 3,
                            previewNextUpgrades: 0,
                            unlockNextUpgradesAfterTimes: 0,
                            type: UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT,
                            nextUpgrades: [],
                        }
                    ],
                }
            ],
        }
    ]
}


