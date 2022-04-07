/**
 * This class is just a facade for your implementation, the tests below are using the `World` class only.
 * Feel free to add the data and behavior, but don't change the public interface.
 */


export class World {
  constructor() {
    this.clusterOfPowerPlants = []
    this.clusterOfHouseholds = []
    this.graphOfHouseholds = {}
    this.HouseholdsConnectedToAlivePowerPlants = []
  }

  createPowerPlant() {
    const id = this.clusterOfPowerPlants.length + 1
    const powerPlant = new PowerPlant(id)
    this.clusterOfPowerPlants.push(powerPlant)
    return powerPlant
  }

  createHousehold() {
    const id = this.clusterOfHouseholds.length + 1
    const household = new Household(id)
    this.clusterOfHouseholds.push(household)
    this.graphOfHouseholds[household.id] = []
    return household
  }

  connectHouseholdToPowerPlant(household, powerPlant) {
    if (!household.checkAliveConnectedPowerPlants() && powerPlant.electricity) {
      this.HouseholdsConnectedToAlivePowerPlants.push(household.id)
    }
    household.connectToPowerPlant(powerPlant)
    powerPlant.connectToHousehold(household)
  }

  connectHouseholdToHousehold(household1, household2) {
    household1.connectToHousehold(household2)
    this.graphOfHouseholds[household1.id] = [...household1.connectedHouseholds]
    household2.connectToHousehold(household1)
    this.graphOfHouseholds[household2.id] = [...household2.connectedHouseholds]
    this.clusterOfHouseholds.forEach(el => el.updateElectricity(this.HouseholdsConnectedToAlivePowerPlants))
  }

  disconnectHouseholdFromPowerPlant(household, powerPlant) {
    household.disconnectFromPowerPlant(powerPlant)
    powerPlant.disconnectFromHousehold(household)
    this.removeHouseholdsWithoutAlivePowerPlants(household)
    household.updateElectricity(this.graphOfHouseholds, this.HouseholdsConnectedToAlivePowerPlants)
    household.connectedHouseholds.forEach(el => el.updateElectricity(this.HouseholdsConnectedToAlivePowerPlants))
  }

  killPowerPlant(powerPlant) {
    powerPlant.kill()
    powerPlant.connectedHouseholds.forEach(household => {
      this.removeHouseholdsWithoutAlivePowerPlants(household)
    })
    this.clusterOfHouseholds.forEach(el => el.updateElectricity(this.HouseholdsConnectedToAlivePowerPlants))

  }

  repairPowerPlant(powerPlant) {
    powerPlant.repair()
    powerPlant.connectedHouseholds.forEach(household => {
      this.removeHouseholdsWithoutAlivePowerPlants(household)
      household.updateElectricity(this.HouseholdsConnectedToAlivePowerPlants)
    })
  }

  householdHasEletricity(household) {
    return household.electricity
  }

  removeHouseholdsWithoutAlivePowerPlants(household) {
    if (!household.checkAliveConnectedPowerPlants()) {
      this.HouseholdsConnectedToAlivePowerPlants = this.HouseholdsConnectedToAlivePowerPlants.filter(el => el !== household.id)
    }
  }
}

class PowerPlant {
  constructor(id) {
    this.id = id
    this.electricity = true
    this.connectedHouseholds = []
  }
  kill() {
    this.electricity = false
  }
  repair() {
    this.electricity = true
  }
  connectToHousehold(household) {
    this.connectedHouseholds.push(household)
  }
  disconnectFromHousehold(household) {
    this.connectedHouseholds = this.connectedHouseholds.filter(el => el.id !== household.id)
  }
}

class Household {
  constructor(id) {
    this.id = id
    this.electricity = false
    this.connectedPowerPlants = []
    this.connectedHouseholds = []
  }

  connectToPowerPlant(powerPlant) {
    this.connectedPowerPlants.push(powerPlant)
    if (powerPlant.electricity && !this.electricity) {
      this.electricity = true
    }
  }

  disconnectFromPowerPlant(powerPlant) {
    this.connectedPowerPlants = this.connectedPowerPlants.filter(el => el.id !== powerPlant.id)
  }

  connectToHousehold(household) {
    this.connectedHouseholds.push(household.id)
    if (this.electricity && !household.electricity) {
      household.electricity = true
    } else if (!this.electricity && household.electricity) {
      this.electricity = true
    }
  }

  checkAliveConnectedPowerPlants() {
    const alivePowerPlants = this.connectedPowerPlants.filter(powerPlant => powerPlant.electricity === true)
    return !!alivePowerPlants.length
  }

  checkAliveConnectedHouseholds(aliveHouseholdsArr) {
    return !!(this.connectedHouseholds.length && aliveHouseholdsArr.length);
  }

  updateElectricity(aliveHouseholdsArr) {
    (this.checkAliveConnectedPowerPlants() || this.checkAliveConnectedHouseholds(aliveHouseholdsArr)) ? this.electricity = true : this.electricity = false
  }
}

