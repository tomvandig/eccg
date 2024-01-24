
export function MakeEntity(name)
{
    return {
        name,
        isEntity: true
    };
}

export function MakeComponent(name, value)
{
    return {
        name,
        value,
        isComponent: true
    };
}

export class eccg
{
    composeGraph = {};
    invComposeGraph = {};
    componentTypeToEntity = {};

    Compose(entity, object)
    {
        if (object.isComponent || object.isEntity)
        {
            if (!this.composeGraph[entity.name])
            {
                this.composeGraph[entity.name] = [];
            }
            this.composeGraph[entity.name].push(object);

            if (object.isEntity)
            {
                if (!this.invComposeGraph[object.name])
                {
                    this.invComposeGraph[object.name] = [];
                }

                this.invComposeGraph[object.name].push(entity.name);
            }

            if (object.isComponent)
            {
                if (!this.componentTypeToEntity[object.name])
                {
                    this.componentTypeToEntity[object.name] = [];
                }
                this.componentTypeToEntity[object.name].push(entity.name);
            }
        }
        else
        {
            throw new Error(`Unknown object`);
        }
    }

    ShallowQueryEntity(name, path)
    {
        console.log(`query shallow entity ${name}`);
        let result = this.composeGraph[name];
        return result ? result.map((obj) => { return { entity: path, composedObject: obj}; }) : [];
    }

    QueryEntity(entity, recursive)
    {
        console.log(`query entity ${entity.name} ${recursive ? "recursive" : ""}`);
        let entitiesInPath = entity.name.split(".");

        let singleEntityInPath = entitiesInPath.length === 1;

        let leaf = entitiesInPath[entitiesInPath.length - 1];
        let currentEntityPath = entitiesInPath.join(".");

        let results = this.ShallowQueryEntity(leaf, entity.name);

        if (!singleEntityInPath)
        {
            // here we should potentially do overrides on current results with what we find on the virtual entity
            let currentEntityPathShallow = this.ShallowQueryEntity(currentEntityPath, entity.name);
            results.push(...currentEntityPathShallow);
        }

        if (recursive)
        {
            console.log(`expand...`);
            let resultsCpy = [...results];
            resultsCpy.forEach(element => {
                if (element.composedObject.isEntity)
                {
                    let childEntity = MakeEntity(`${element.entity}.${element.composedObject.name}`);
                    let childResults = this.QueryEntity(childEntity, true);
                    
                    results.push(...childResults);
                }
            });
            console.log(`...end expand`);
        }

        return results;
    }

    FindAllParentsInComposeGraph(entity, entityPath, result)
    {
        result.push(entityPath);

        let invSet = this.invComposeGraph[entity];

        if (invSet)
        {
            invSet.forEach((inv) => {
                let virtual = `${inv}.${entityPath}`;

                this.FindAllParentsInComposeGraph(inv, virtual, result)
            })
        }
    }

    QueryComponent(component)
    {
        let directSet = this.componentTypeToEntity[component.name];

        if (!directSet) return [];

        let result = [];

        for (let i = 0; i < directSet.length; i++)
        {
            let direct = directSet[i];

            this.FindAllParentsInComposeGraph(direct, direct, result);
        }

        return result;
    }

    StripQueryWildCard(name)
    {
        return name.split(".").filter(e => e !== "*").join(".")
    }

    Query(obj)
    {
        if (obj.isEntity)
        {
            let stripped = this.StripQueryWildCard(obj.name);
            let recursive = stripped.split(".").length !== obj.name.split(".").length;
            return this.QueryEntity(MakeEntity(stripped), recursive);
        }
        else if (obj.isComponent)
        {
            return this.QueryComponent(obj);
        }
        else
        {
            throw new Error(`Unsupported`);
        }
    }
}