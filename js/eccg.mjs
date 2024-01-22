
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

    QueryEntity(entity, path, recursive)
    {
        console.log(`query entity ${entity.name} ${recursive ? "recursive" : ""}`);
        let parts = entity.name.split(".");

        let singlePart = parts.length === 1;

        let main = parts[parts.length - 1];
        let secondary = parts.join(".");

        let results = this.ShallowQueryEntity(main, path);

        if (!singlePart)
        {
            let secondaryShallow = this.ShallowQueryEntity(secondary, path);
            results.push(...secondaryShallow);
        }

        if (recursive)
        {
            console.log(`expand...`);
            let resultsCpy = [...results];
            resultsCpy.forEach(element => {
                if (element.composedObject.isEntity)
                {
                    let virtual = MakeEntity(`${element.entity}.${element.composedObject.name}`);
                    let virtualResults = this.QueryEntity(virtual, virtual.name, true);
                    
                    results.push(...virtualResults);
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
            return this.QueryEntity(MakeEntity(stripped), stripped, recursive);
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