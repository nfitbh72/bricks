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
                    name: t('game.upgrades.lasers.name'),
                    description: t('game.upgrades.lasers.description'),
                    times: 1,
                    previewNextUpgrades: 1,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BAT_ADD_SHOOTER,
                    nextUpgrades: [
                        {
                            name: t('game.upgrades.lasersPlus.name'),
                            description: t('game.upgrades.lasersPlus.description'),
                            times: 3,
                            previewNextUpgrades: 0,
                            unlockNextUpgradesAfterTimes: 0,
                            nextUpgrades: [],
                            type: UpgradeType.BAT_SHOOTER_INCREASE_10_PERCENT,
                        }
                    ],
                },
                {
                    name: t('game.upgrades.lives.name'),
                    description: t('game.upgrades.lives.description'),
                    times: 3,
                    previewNextUpgrades: 1,
                    unlockNextUpgradesAfterTimes: 2,
                    type: UpgradeType.HEALTH_INCREASE_1,
                    nextUpgrades: [
                        {
                            name: t('game.upgrades.slowerBall.name'),
                            description: t('game.upgrades.slowerBall.description'),
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
            name: t('game.upgrades.ballDamage.name'),
            description: t('game.upgrades.ballDamage.description'),
            times: 3,
            previewNextUpgrades: 1,
            unlockNextUpgradesAfterTimes: 2,
            type: UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1,
            nextUpgrades: [
                {
                    name: t('game.upgrades.piercing.name'),
                    description: t('game.upgrades.piercing.description'),
                    times: 1,
                    previewNextUpgrades: 1,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BALL_ADD_PIERCING,
                    nextUpgrades: [
                        {
                            name: t('game.upgrades.piercingPlus.name'),
                            description: t('game.upgrades.piercingPlus.description'),
                            times: 3,
                            previewNextUpgrades: 1,
                            unlockNextUpgradesAfterTimes: 2,
                            type: UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT,
                            nextUpgrades: [
                                {
                                    name: t('game.upgrades.piercingDuration.name'),
                                    description: t('game.upgrades.piercingDuration.description'),
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
                    name: t('game.upgrades.criticalHits.name'),
                    description: t('game.upgrades.criticalHits.description'),
                    times: 1,
                    previewNextUpgrades: 0,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BALL_ADD_CRITICAL_HITS,
                    nextUpgrades: [
                        {
                            name: t('game.upgrades.criticalHitsPlus.name'),
                            description: t('game.upgrades.criticalHitsPlus.description'),
                            times: 3,
                            previewNextUpgrades: 0,
                            unlockNextUpgradesAfterTimes: 0,
                            type: UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT,
                            nextUpgrades: [],
                        }
                    ],
                },
                {
                    name: t('game.upgrades.explosions.name'),
                    description: t('game.upgrades.explosions.description'),
                    times: 1,
                    previewNextUpgrades: 0,
                    unlockNextUpgradesAfterTimes: 1,
                    type: UpgradeType.BALL_EXPLOSIONS,
                    nextUpgrades: [
                        {
                            name: t('game.upgrades.explosionsPlus.name'),
                            description: t('game.upgrades.explosionsPlus.description'),
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


