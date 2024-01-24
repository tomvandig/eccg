import { MakeComponent, MakeEntity, MakeComposedEntity, eccg } from "./eccg.mjs";

function test()
{
    let repo = new eccg();

    let A = MakeEntity("A");
    let B = MakeEntity("B");
    let AB = MakeEntity("A.B");
    let PropA = MakeComponent("Property", "Property");
    let LocationAB = MakeComponent("Location", "Location");
    let LocationB = MakeComponent("Geometry", "Geometry");

    repo.Compose(A, PropA);
    repo.Compose(B, LocationB);
    repo.Compose(A, B);
    repo.Compose(AB, LocationAB);

    console.log(repo.Query(A));
    console.log(repo.Query(B));
    console.log(repo.Query(AB));

    console.log(repo.Query(MakeEntity("A.*")));
    console.log(repo.Query(MakeEntity("B.*")));
    console.log(repo.Query(MakeEntity("A.B.*")));
}

function test2()
{
    let repo = new eccg();

    let A = MakeEntity("A");
    let B = MakeEntity("B");
    let C = MakeEntity("C");

    let PropA = MakeComponent("Property", "PropertyA");
    let PropB = MakeComponent("Property", "PropertyB");
    let PropC = MakeComponent("Property", "PropertyC");

    repo.Compose(A, PropA);
    repo.Compose(B, PropB);
    repo.Compose(C, PropC);

    repo.Compose(A, B);
    repo.Compose(B, C);

    console.log(repo.Query(MakeEntity("A.*")));
    console.log(repo.Query(MakeEntity("A.B.*")));
    console.log(repo.Query(MakeEntity("A.B.C.*")));
}

function test3()
{
    let repo = new eccg();

    let A = MakeEntity("A");
    let B = MakeEntity("B");
    let C = MakeEntity("C");
    let D = MakeEntity("D");

    let PropC = MakeComponent("Property", "PropertyC");

    repo.Compose(C, PropC);

    repo.Compose(A, B);
    repo.Compose(B, C);
    repo.Compose(D, B);

    console.log(repo.Query(MakeComponent("Property")));
}

function testaec()
{
    let repo = new eccg();

    let SpaceHeater1 = MakeEntity("SpaceHeater1");
    let SpaceHeater2 = MakeEntity("SpaceHeater2");
    let ConvectionHeater = MakeEntity("ConvectionHeater");
    let EnergyTransferArchetype = MakeEntity("EnergyTransferArchetype");

    let Name1 = MakeComponent("Name", "SpaceHeater1");
    let Name2 = MakeComponent("Name", "SpaceHeater2");
    let HeatingCoefficient = MakeComponent("HeatingCoefficient", "default: 382 mg/s");
    let HeatingCoefficientOverride = MakeComponent("HeatingCoefficient", "overridden: 235 mg/s");

    repo.Compose(EnergyTransferArchetype, HeatingCoefficient);
    repo.Compose(SpaceHeater1, Name1);
    repo.Compose(SpaceHeater2, Name2);
    repo.Compose(MakeEntity("SpaceHeater1.ConvectionHeater.EnergyTransferArchetype"), HeatingCoefficientOverride);

    repo.Compose(SpaceHeater1, ConvectionHeater);
    repo.Compose(SpaceHeater2, ConvectionHeater);
    repo.Compose(ConvectionHeater, EnergyTransferArchetype);

    console.log(repo.Query(MakeComponent("HeatingCoefficient")));
    console.log(repo.Query(MakeEntity("SpaceHeater1.*")));
    console.log(repo.Query(MakeEntity("SpaceHeater1.ConvectionHeater.EnergyTransferArchetype.*")));
    console.log(repo.Query(MakeEntity("SpaceHeater2.ConvectionHeater.EnergyTransferArchetype.*")));
}

function test_mads()
{
    let repo = new eccg();

    let archetypeSpaceArchitect = MakeEntity("Space-Architect");
    let archetypeSpaceEngineer = MakeEntity("Space-Engineer");

    repo.Compose(archetypeSpaceArchitect, MakeComponent("Classification", "Room"));
    repo.Compose(archetypeSpaceArchitect, MakeComponent("Geometry", "Extrusion"));
    repo.Compose(archetypeSpaceArchitect, MakeComponent("Identity", "undefined"));
    repo.Compose(archetypeSpaceArchitect, MakeComponent("Occupancy-Code", "undefined"));
    repo.Compose(archetypeSpaceArchitect, MakeComponent("SpaceType-Functional", "default"));


    repo.Compose(archetypeSpaceEngineer, MakeComponent("Occupancy-Energy", "A-01"));
    repo.Compose(archetypeSpaceEngineer, MakeComponent("SpaceType-Energy", "default"));

    let apartmentTypical = MakeEntity("Room");

    repo.Compose(apartmentTypical, archetypeSpaceArchitect);
    repo.Compose(apartmentTypical, archetypeSpaceEngineer);

    let archApart = MakeComposedEntity(apartmentTypical, archetypeSpaceArchitect);
    let engApart = MakeComposedEntity(apartmentTypical, archetypeSpaceEngineer);

    repo.Compose(archApart, MakeComponent("Occupancy-Code", "Z1"));
    repo.Compose(archApart, MakeComponent("SpaceType-Functional", "Apartment"));

    repo.Compose(engApart, MakeComponent("Occupancy-Energy", "A-03"));
    repo.Compose(engApart, MakeComponent("SpaceType-Energy", "Residential"));

    let apartmentA01 = MakeEntity("Apartment-A01");
    let apartmentA02 = MakeEntity("Apartment-A02");

    repo.Compose(apartmentA01, apartmentTypical);
    repo.Compose(apartmentA02, apartmentTypical);

    repo.Compose(MakeComposedEntity(apartmentA01, archApart), MakeComponent("Identity", "Apartment-A-01"));
    repo.Compose(MakeComposedEntity(apartmentA02, archApart), MakeComponent("Identity", "Apartment-A-02"));

    console.log(repo.Query(MakeComponent("SpaceType-Functional")));
    console.log(repo.Query(MakeEntity("Space:Architect.*")).filter((e)=>e.composedObject.isComponent).map((e)=>`${e.entity}: ${e.composedObject.name}: ${e.composedObject.value}`));
    console.log(repo.Query(MakeEntity("Room.*")).filter((e)=>e.composedObject.isComponent).map((e)=>`${e.entity}: ${e.composedObject.name}: ${e.composedObject.value}`));
    console.log(repo.Query(MakeEntity("Apartment-A01.*")).filter((e)=>e.composedObject.isComponent).map((e)=>`${e.entity}: ${e.composedObject.name}: ${e.composedObject.value}`));
    console.log(repo.Query(MakeEntity("Apartment-A02.*")).filter((e)=>e.composedObject.isComponent).map((e)=>`${e.entity}: ${e.composedObject.name}: ${e.composedObject.value}`));

    console.log(repo.ToMermaid());
}

test_mads();